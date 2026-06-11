from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.ml.predict import predict_risk
from app.models.water_quality import WaterQuality
from app.models.symptom_report import SymptomReport
from datetime import datetime, timedelta

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    return jsonify(predict_risk(request.get_json())), 200


@predictions_bp.route('/village/<string:village_name>', methods=['GET'])
@jwt_required()
def village_risk(village_name):
    since   = datetime.utcnow() - timedelta(days=7)
    wq      = WaterQuality.query.filter(
                WaterQuality.village == village_name,
                WaterQuality.created_at >= since
              ).order_by(WaterQuality.created_at.desc()).first()
    reports = SymptomReport.query.filter(
                SymptomReport.village == village_name,
                SymptomReport.submitted_at >= since
              ).all()

    if not reports and not wq:
        return jsonify({'error': 'No recent data for this village'}), 404

    inp = {}
    if wq:
        inp.update({
            'turbidity':              wq.turbidity or 0,
            'chlorophyll_a':          wq.chlorophyll_a or 0,
            'nitrates':               wq.nitrates or 0,
            'sulphates':              wq.sulphates or 0,
            'ph':                     wq.ph_level or 7.0,
            'dissolved_oxygen':       wq.dissolved_oxygen or 6.0,
            'total_suspended_solids': wq.total_suspended_solids or 0,
        })
    if reports:
        n = len(reports)
        inp.update({
            'diarrhea':           sum(r.diarrhea for r in reports) / n,
            'vomiting':           sum(r.vomiting for r in reports) / n,
            'fever':              sum(r.fever for r in reports) / n,
            'abdominal_pain':     sum(r.abdominal_pain for r in reports) / n,
            'dehydration':        sum(r.dehydration for r in reports) / n,
            'water_source':       reports[0].water_source,
            'household_affected': sum(r.household_affected for r in reports) / n,
            'age_group':          1,
        })

    result = predict_risk(inp)
    result['village']          = village_name
    result['reports_analyzed'] = len(reports)
    return jsonify(result), 200
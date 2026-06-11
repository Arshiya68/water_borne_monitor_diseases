from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.water_quality import WaterQuality

water_quality_bp = Blueprint('water_quality', __name__)

@water_quality_bp.route('/add', methods=['POST'])
@jwt_required()
def add_reading():
    claims = get_jwt()
    if claims.get('role') not in ('official', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403

    d = request.get_json()
    now = __import__('datetime').datetime.utcnow()
    wq = WaterQuality(
        village=d['village'], district=d['district'],
        state=d['state'],
        latitude=d.get('latitude'), longitude=d.get('longitude'),
        turbidity=d.get('turbidity'),
        chlorophyll_a=d.get('chlorophyll_a'),
        nitrates=d.get('nitrates'),
        sulphates=d.get('sulphates'),
        ph_level=d.get('ph'),
        dissolved_oxygen=d.get('dissolved_oxygen'),
        total_suspended_solids=d.get('total_suspended_solids'),
        data_source=d.get('data_source', 'manual'),
        recorded_year=d.get('recorded_year', now.year),
        recorded_month=d.get('recorded_month', now.month),
    )
    db.session.add(wq)
    db.session.commit()
    return jsonify({'message': 'Reading added', 'id': wq.id}), 201


@water_quality_bp.route('/list', methods=['GET'])
@jwt_required()
def list_readings():
    village = request.args.get('village')
    district = request.args.get('district')
    q = WaterQuality.query
    if village:
        q = q.filter_by(village=village)
    if district:
        q = q.filter_by(district=district)
    rows = q.order_by(
        WaterQuality.recorded_year.desc(),
        WaterQuality.recorded_month.desc()
    ).limit(200).all()
    return jsonify([r.to_dict() for r in rows]), 200
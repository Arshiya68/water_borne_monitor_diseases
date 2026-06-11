from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from app.models.user import User
from app.models.incident_report import IncidentReport

incidents_bp = Blueprint(
    "incidents",
    __name__
)

@incidents_bp.route('/incident-report', methods=['POST'])
@jwt_required()
def create_incident():

    user_id = int(get_jwt_identity())

    user = User.query.get(user_id)

    data = request.get_json()

    report = IncidentReport(
        user_id=user_id,
        issue_type=data.get("issue_type"),
        description=data.get("description"),
        village=user.village,
        district=user.district,
        state=user.state,
        latitude=user.latitude,
        longitude=user.longitude
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({
        "message": "Incident reported successfully",
        "incident": report.to_dict()
    }), 201

@incidents_bp.route('/incidents/list', methods=['GET'])
@jwt_required()
def list_incidents():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if user.role in ('admin', 'official'):
        incidents = IncidentReport.query.order_by(IncidentReport.created_at.desc()).all()
    else:
        incidents = IncidentReport.query.filter_by(district=user.district).order_by(IncidentReport.created_at.desc()).all()
        
    return jsonify([inc.to_dict() for inc in incidents]), 200
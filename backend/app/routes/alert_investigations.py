from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.notification import Notification
from app.models.alert_investigation import AlertInvestigation
from datetime import datetime

alert_investigations_bp = Blueprint('alert_investigations', __name__)

@alert_investigations_bp.route('/investigate', methods=['POST'])
@jwt_required()
def investigate_alert():
    """Create or update alert investigation"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role not in ['asha_worker', 'official', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json() or {}
        alert_id = data.get('alert_id')
        findings = data.get('findings')
        verification_status = data.get('verification_status', 'Pending')  # 'Under Investigation', 'Verified', 'Resolved', 'Rejected'
        village = data.get('village')

        if not alert_id:
            return jsonify({'error': 'Alert ID is required'}), 400

        alert = Notification.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404

        # Check if an investigation already exists for this alert and ASHA worker
        investigation = AlertInvestigation.query.filter_by(alert_id=alert_id, asha_worker_id=user_id).first()
        if investigation:
            investigation.findings = findings or investigation.findings
            investigation.verification_status = verification_status
            investigation.visit_date = datetime.utcnow()
        else:
            investigation = AlertInvestigation(
                alert_id=alert_id,
                asha_worker_id=user_id,
                village=village or alert.village or user.village,
                findings=findings,
                verification_status=verification_status,
                visit_date=datetime.utcnow()
            )
            db.session.add(investigation)

        db.session.commit()

        return jsonify({
            'message': 'Alert investigation logged successfully',
            'investigation': investigation.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Investigate alert error: {str(e)}")
        return jsonify({'error': 'Failed to log alert investigation'}), 500


@alert_investigations_bp.route('', methods=['GET'])
@jwt_required()
def list_alert_investigations():
    """List all alert investigations"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role in ['official', 'admin']:
            investigations = AlertInvestigation.query.order_by(AlertInvestigation.visit_date.desc()).all()
        else:
            investigations = AlertInvestigation.query.filter_by(asha_worker_id=user_id).order_by(AlertInvestigation.visit_date.desc()).all()

        return jsonify([i.to_dict() for i in investigations]), 200

    except Exception as e:
        print(f"List alert investigations error: {str(e)}")
        return jsonify({'error': 'Failed to get investigations'}), 500

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app import db
from app.models.user import User
from app.models.symptom_report import SymptomReport
from app.models.notification import Notification
from datetime import datetime
from app.utils.notifications import send_alerts_to_users

alerts_bp = Blueprint('alerts', __name__)


@alerts_bp.route('/trigger', methods=['POST'])
@jwt_required()
def trigger_alert():
    """Send alert to a village or district and save it to the database"""
    claims = get_jwt()
    if claims.get('role') not in ('official', 'admin', 'asha_worker'):
        return jsonify({'error': 'Unauthorized'}), 403

    sender_id = int(get_jwt_identity())
    data = request.get_json() or {}
    village = data.get('village')
    district = data.get('district')
    risk_level = data.get('risk_level', 'High')
    custom_message = data.get('message')

    if not village and not district:
        return jsonify({'error': 'Village or district is required'}), 400

    target_label = district or village
    target_type = 'district' if district else 'village'

    try:
        alert_message = custom_message or f"HEALTH ALERT [{risk_level}]: Possible waterborne disease risk in {target_label}. Follow safety guidance and take precautions."

        # Fetch matching active users
        if district:
            users = User.query.filter_by(district=district).filter_by(is_active=True).all()
        else:
            users = User.query.filter_by(village=village).filter_by(is_active=True).all()

        user_dicts = [u.to_dict() for u in users]

        # Save to database first
        alert_record = Notification(
            sender_id=sender_id,
            village=village,
            district=district,
            risk_level=risk_level,
            message=alert_message,
            created_at=datetime.utcnow()
        )
        db.session.add(alert_record)
        db.session.commit()

        # Try sending SMS / Email notifications
        results = {}
        if user_dicts:
            results = send_alerts_to_users(user_dicts, alert_message)

        return jsonify({
            'message': 'Alert sent and saved successfully',
            'target': target_label,
            'target_type': target_type,
            'risk_level': risk_level,
            'attempted': results.get('attempted', 0) if user_dicts else 0,
            'sms_sent': results.get('sms_sent', 0) if user_dicts else 0,
            'email_sent': results.get('email_sent', 0) if user_dicts else 0,
            'skipped': results.get('skipped', 0) if user_dicts else 0,
            'timestamp': datetime.utcnow().isoformat(),
            'alert': alert_record.to_dict(),
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@alerts_bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get notifications relevant to the logged-in user's location"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # If admin or official, return all notifications
        if user.role in ('admin', 'official'):
            alerts = Notification.query.order_by(Notification.created_at.desc()).all()
        else:
            # Return alerts matching user's village, user's district, or global broadcasts
            alerts = Notification.query.filter(
                (Notification.village == user.village) |
                (Notification.district == user.district) |
                ((Notification.village == None) & (Notification.district == None))
            ).order_by(Notification.created_at.desc()).all()

        return jsonify([a.to_dict() for a in alerts]), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
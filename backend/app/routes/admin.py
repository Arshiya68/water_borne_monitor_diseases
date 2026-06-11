from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from datetime import datetime



admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/analysis', methods=['GET'])
@jwt_required()
def admin_analysis():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    # Aggregate report statistics for admin dashboard
    from app.models.symptom_report import SymptomReport
    total_reports = SymptomReport.query.count()
    verified_reports = SymptomReport.query.filter_by(verified=True).count()
    high = SymptomReport.query.filter(SymptomReport.predicted_risk.ilike('%high%')).count()
    medium = SymptomReport.query.filter(SymptomReport.predicted_risk.ilike('%medium%')).count()
    low = SymptomReport.query.filter(SymptomReport.predicted_risk.ilike('%low%')).count()

    # Reports per village (top 10)
    from sqlalchemy import func
    per_village = (
        db.session.query(SymptomReport.village, func.count(SymptomReport.id).label('count'))
        .group_by(SymptomReport.village)
        .order_by(func.count(SymptomReport.id).desc())
        .limit(10)
        .all()
    )

    village_data = [{'village': r[0], 'count': r[1]} for r in per_village]

    return jsonify({
        'total_reports': total_reports,
        'verified_reports': verified_reports,
        'risk_distribution': {'high': high, 'medium': medium, 'low': low},
        'reports_by_village': village_data,
    }), 200


def serialize_user(user):
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'phone': user.phone,
        'role': user.role,
        'village': user.village,
        'district': user.district,
        'is_active': user.is_active,
        'created_at': user.created_at.isoformat() if user.created_at else None,
    }


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([serialize_user(u) for u in users]), 200


@admin_bp.route('/users/<int:user_id>/role', methods=['PATCH'])
@jwt_required()
def change_user_role(user_id):
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json() or {}
    new_role = (data.get('role') or '').strip().lower()
    if not new_role:
        return jsonify({'error': 'Role is required'}), 400

    allowed = {'villager', 'asha_worker', 'official', 'admin'}
    if new_role not in allowed:
        return jsonify({'error': 'Invalid role'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404


    user.role = new_role
    # Optionally toggle active on demote/promote
    if 'is_active' in data:
        user.is_active = bool(data.get('is_active'))

    user.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'User role updated', 'user': serialize_user(user)}), 200


@admin_bp.route('/model/retrain', methods=['POST'])
@jwt_required()
def retrain_ml_model():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        from app.ml.train import train_model
        import os
        from datetime import datetime

        # Execute training
        train_model()

        model_path = os.path.join(os.path.dirname(__file__), '../../../data/models/outbreak_model.pkl')
        mtime = os.path.getmtime(model_path)
        last_updated = datetime.fromtimestamp(mtime).isoformat()

        return jsonify({
            'message': 'Machine Learning model successfully retrained on combined datasets!',
            'model_version': '1.1',
            'last_updated': last_updated,
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({'error': f'Model retraining failed: {str(e)}'}), 500

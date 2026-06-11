from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models.user import User
from datetime import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/update', methods=['PATCH'])
@jwt_required()
def update_profile():
    """Update user profile"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'district' in data:
            user.district = data['district']
        if 'district_id' in data:
            user.district_id = data['district_id']
        if 'village' in data:
            user.village = data['village']
        if 'age' in data:
            user.age = data.get('age')
        if 'gender' in data:
            user.gender = data.get('gender')
        if 'prefer_sms' in data:
            user.prefer_sms = data['prefer_sms']
        if 'prefer_email' in data:
            user.prefer_email = data['prefer_email']

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
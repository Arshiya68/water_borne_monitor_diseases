from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from datetime import datetime
import re
import json

ALLOWED_ROLES = {'villager', 'asha_worker', 'official', 'admin'}

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        # Get raw data safely
        if request.is_json:
            data = request.get_json()
        else:
            data = json.loads(request.data)
        
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid request format'}), 400
        
        # Validate required fields
        required = ['name', 'email', 'phone', 'password', 'role', 'village', 'district']
        for field in required:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        name = str(data['name']).strip()
        email = str(data['email']).strip().lower()
        phone = str(data['phone']).replace('-', '').replace(' ', '')
        password = str(data['password'])
        role = str(data['role']).strip().lower()
        village = str(data['village']).strip()
        district = str(data['district']).strip()
        state = str(data.get('state', 'Telangana'))
        age = data.get('age')
        gender = str(data.get('gender', ''))
        prefer_sms = bool(data.get('prefer_sms', True))
        prefer_email = bool(data.get('prefer_email', True))
        
        # Validate name
        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters'}), 400
        
        # Validate email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate phone format
        if not re.match(r'^\d{10}$', phone):
            return jsonify({'error': 'Phone must be 10 digits'}), 400
        
        # Validate password
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if email exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Check if phone exists
        if User.query.filter_by(phone=phone).first():
            return jsonify({'error': 'Phone already registered'}), 400

        # Validate requested role and authorization
        role = role.lower()
        if role not in ALLOWED_ROLES:
            return jsonify({'error': 'Invalid role selected'}), 400

        # Create user
        user = User(
            name=name,
            email=email,
            phone=phone,
            role=role,
            village=village,
            district=district,
            state=state,
            age=int(age) if age else None,
            gender=gender,
            prefer_sms=prefer_sms,
            prefer_email=prefer_email,
        )
        
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful',
            'user_id': user.id,
            'email': user.email,
        }), 201
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON format'}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Register error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        # Get raw data safely
        if request.is_json:
            data = request.get_json()
        else:
            data = json.loads(request.data) if request.data else {}
        
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid request format'}), 400
        
        email = str(data.get('email', '')).strip().lower()
        password = str(data.get('password', ''))
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Check password
        if not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account inactive'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create token
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                'email': user.email,
                'name': user.name,
                'role': user.role,
            }
        )
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone,
                'role': user.role,
            }
        }), 200
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON'}), 400
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        print(f"Get user error: {str(e)}")
        return jsonify({'error': 'Failed to get user'}), 500


@auth_bp.route('/profile/update', methods=['PATCH'])
@jwt_required()
def update_profile():
    """Update profile"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if request.is_json:
            data = request.get_json()
        else:
            data = json.loads(request.data) if request.data else {}
        
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid request'}), 400
        
        # Update fields
        if 'name' in data:
            name = str(data['name']).strip()
            if len(name) >= 2:
                user.name = name
        
        if 'phone' in data:
            phone = str(data['phone']).replace('-', '').replace(' ', '')
            if re.match(r'^\d{10}$', phone):
                existing = User.query.filter(User.phone == phone, User.id != user_id).first()
                if not existing:
                    user.phone = phone
        
        if 'village' in data:
            user.village = str(data['village']).strip()
        
        if 'district' in data:
            user.district = str(data['district']).strip()
        
        if 'age' in data:
            user.age = int(data['age']) if data['age'] else None
        
        if 'gender' in data:
            user.gender = str(data['gender'])
        
        if 'prefer_sms' in data:
            user.prefer_sms = bool(data['prefer_sms'])
        
        if 'prefer_email' in data:
            user.prefer_email = bool(data['prefer_email'])
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update error: {str(e)}")
        return jsonify({'error': 'Update failed'}), 500
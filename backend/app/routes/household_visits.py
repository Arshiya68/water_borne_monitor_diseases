from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.household_visit import HouseholdVisit
from datetime import datetime

household_visits_bp = Blueprint('household_visits', __name__)

@household_visits_bp.route('', methods=['POST'])
@jwt_required()
def log_household_visit():
    """Log a direct field visit by ASHA worker"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role not in ['asha_worker', 'official', 'admin']:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json() or {}
        
        household_name = data.get('household_name')
        village = data.get('village') or user.village
        family_members = int(data.get('family_members', 1))
        water_source = data.get('water_source')
        sick_members_count = int(data.get('sick_members_count', 0))
        symptoms = data.get('symptoms')  # Comma-separated list
        status = data.get('status', 'Healthy')
        notes = data.get('notes')
        
        visit_date_str = data.get('visit_date')
        visit_date = datetime.strptime(visit_date_str, '%Y-%m-%d') if visit_date_str else datetime.utcnow()
        
        follow_up_date_str = data.get('follow_up_date')
        follow_up_date = datetime.strptime(follow_up_date_str, '%Y-%m-%d') if follow_up_date_str else None

        if not household_name:
            return jsonify({'error': 'Household name is required'}), 400

        visit = HouseholdVisit(
            asha_worker_id=user_id,
            household_name=household_name,
            village=village,
            family_members=family_members,
            water_source=water_source,
            sick_members_count=sick_members_count,
            symptoms=symptoms,
            status=status,
            notes=notes,
            visit_date=visit_date,
            follow_up_date=follow_up_date,
        )

        db.session.add(visit)
        db.session.commit()

        return jsonify({
            'message': 'Household visit logged successfully',
            'visit': visit.to_dict(),
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Log household visit error: {str(e)}")
        return jsonify({'error': 'Failed to log visit'}), 500


@household_visits_bp.route('', methods=['GET'])
@jwt_required()
def list_household_visits():
    """List household visits"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role in ['official', 'admin']:
            visits = HouseholdVisit.query.order_by(HouseholdVisit.visit_date.desc()).all()
        else:
            # ASHA worker gets their own logs
            visits = HouseholdVisit.query.filter_by(asha_worker_id=user_id).order_by(HouseholdVisit.visit_date.desc()).all()

        return jsonify([v.to_dict() for v in visits]), 200

    except Exception as e:
        print(f"List household visits error: {str(e)}")
        return jsonify({'error': 'Failed to get household visits'}), 500

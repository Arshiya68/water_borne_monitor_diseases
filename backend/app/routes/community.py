from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import CommunityEngagement, SymptomReport, User
from datetime import datetime, timedelta

community_bp = Blueprint('community', __name__, url_prefix='/community')

@community_bp.route('/engagement/<district>', methods=['GET'])
@jwt_required()
def get_community_engagement(district):
    """Get community engagement metrics for a district"""
    engagement = CommunityEngagement.query.filter_by(district=district).first()
    
    if not engagement:
        # Calculate from data
        engagement = CommunityEngagement(
            district=district,
            total_population=2847,
        )
    
    # Recalculate metrics
    total_reports = SymptomReport.query.filter_by(district=district).count()
    verified_reports = SymptomReport.query.filter(
        SymptomReport.district == district,
        SymptomReport.verification_status == 'verified'
    ).count()
    active_volunteers = User.query.filter(
        User.district == district,
        User.role.in_(['asha_worker', 'volunteer'])
    ).count()
    
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    last_30_days_reports = SymptomReport.query.filter(
        SymptomReport.district == district,
        SymptomReport.submitted_at >= thirty_days_ago
    ).count()
    
    engagement.total_reports_submitted = total_reports
    engagement.verified_reports = verified_reports
    engagement.active_volunteers = active_volunteers
    engagement.last_30_days_reports = last_30_days_reports
    engagement.calculate_engagement_score()
    
    # Check badges
    if engagement.verified_reports > 0:
        engagement.has_100_percent_alert = (engagement.read_count / engagement.verified_reports) >= 1.0 if hasattr(engagement, 'read_count') else False
    engagement.is_top_ward = last_30_days_reports > 20
    engagement.has_high_trust = engagement.verification_rate >= 80 if engagement.verified_reports > 0 else False
    engagement.is_team_player = active_volunteers >= 20
    
    db.session.merge(engagement)
    db.session.commit()
    
    return jsonify(engagement.to_dict()), 200

@community_bp.route('/top-contributors/<district>', methods=['GET'])
@jwt_required()
def get_top_contributors(district):
    """Get top community contributors in a district"""
    limit = int(request.args.get('limit', 10))
    
    # Get users who have submitted reports
    users = db.session.query(
        User.id,
        User.username,
        db.func.count(SymptomReport.id).label('report_count')
    ).join(
        SymptomReport, User.id == SymptomReport.user_id
    ).filter(
        User.district == district
    ).group_by(User.id, User.username).order_by(
        db.desc('report_count')
    ).limit(limit).all()
    
    contributors = []
    for idx, (user_id, username, count) in enumerate(users, 1):
        verified_count = SymptomReport.query.filter(
            SymptomReport.user_id == user_id,
            SymptomReport.verification_status == 'verified'
        ).count()
        
        badge = ['🥇', '🥈', '🥉', '⭐'][min(idx - 1, 3)]
        
        contributors.append({
            'badge': badge,
            'name': username,
            'reports': count,
            'verified': verified_count,
            'rank': idx,
        })
    
    return jsonify(contributors), 200

@community_bp.route('/participation-score/<district>', methods=['GET'])
@jwt_required()
def get_participation_score(district):
    """Get overall community participation score for a district"""
    engagement = CommunityEngagement.query.filter_by(district=district).first()
    
    if not engagement:
        engagement = CommunityEngagement(district=district)
    
    # Recalculate
    total_population = 2847  # Example
    total_reports = SymptomReport.query.filter_by(district=district).count()
    verified_reports = SymptomReport.query.filter(
        SymptomReport.district == district,
        SymptomReport.verification_status == 'verified'
    ).count()
    active_volunteers = User.query.filter(
        User.district == district,
        User.role.in_(['asha_worker', 'volunteer'])
    ).count()
    
    engagement.total_population = total_population
    engagement.total_reports_submitted = total_reports
    engagement.verified_reports = verified_reports
    engagement.active_volunteers = active_volunteers
    engagement.calculate_engagement_score()
    
    return jsonify({
        'district': district,
        'engagement_score': engagement.engagement_score,
        'participation_rate': engagement.participation_rate,
        'total_reports': total_reports,
        'verified_reports': verified_reports,
        'active_volunteers': active_volunteers,
        'participation_trend': '+15%',
    }), 200

@community_bp.route('/update-engagement/<district>', methods=['POST'])
@jwt_required()
def update_engagement_metrics(district):
    """Manually update engagement metrics (admin only)"""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    engagement = CommunityEngagement.query.filter_by(district=district).first()
    if not engagement:
        engagement = CommunityEngagement(district=district)
    
    engagement.total_population = data.get('total_population', engagement.total_population)
    engagement.total_reports_submitted = data.get('total_reports_submitted', engagement.total_reports_submitted)
    engagement.verified_reports = data.get('verified_reports', engagement.verified_reports)
    engagement.active_volunteers = data.get('active_volunteers', engagement.active_volunteers)
    
    engagement.calculate_engagement_score()
    
    db.session.add(engagement)
    db.session.commit()
    
    return jsonify({'message': 'Engagement updated', 'engagement': engagement.to_dict()}), 200

@community_bp.route('/health-workers/<district>', methods=['GET'])
@jwt_required()
def get_health_workers(district):
    """Get health workers (ASHA workers, volunteers) in a district"""
    workers = User.query.filter(
        User.district == district,
        User.role.in_(['asha_worker', 'volunteer']),
        User.is_active == True
    ).all()
    
    return jsonify([{
        'id': w.id,
        'username': w.username,
        'role': w.role,
        'village': w.village,
        'phone': w.phone_number if hasattr(w, 'phone_number') else None,
    } for w in workers]), 200

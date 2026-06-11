from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import WaterSource
from datetime import datetime

water_sources_bp = Blueprint('water_sources', __name__, url_prefix='/water-sources')

@water_sources_bp.route('/list', methods=['GET'])
@jwt_required()
def list_water_sources():
    """Get water sources, optionally filtered by village or district"""
    village = request.args.get('village')
    district = request.args.get('district')
    
    query = WaterSource.query
    
    if village:
        query = query.filter_by(village=village)
    if district:
        query = query.filter_by(district=district)
    
    sources = query.all()
    return jsonify([source.to_dict() for source in sources]), 200

@water_sources_bp.route('/<int:source_id>', methods=['GET'])
@jwt_required()
def get_water_source(source_id):
    """Get details of a specific water source"""
    source = WaterSource.query.get(source_id)
    
    if not source:
        return jsonify({'error': 'Water source not found'}), 404
    
    return jsonify(source.to_dict()), 200

@water_sources_bp.route('/add', methods=['POST'])
@jwt_required()
def add_water_source():
    """Add a new water source (officials only)"""
    claims = get_jwt()
    if claims.get('role') not in ('official', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    required_fields = ['name', 'location', 'village', 'district', 'state', 'source_type']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    source = WaterSource(
        name=data['name'],
        location=data['location'],
        village=data['village'],
        district=data['district'],
        state=data['state'],
        source_type=data['source_type'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        status=data.get('status', 'safe'),
        ph_level=data.get('ph_level'),
        turbidity=data.get('turbidity'),
        bacterial_count=data.get('bacterial_count'),
        capacity=data.get('capacity'),
        availability=data.get('availability'),
        last_tested=datetime.utcnow(),
    )
    
    db.session.add(source)
    db.session.commit()
    
    return jsonify({'message': 'Water source added', 'id': source.id}), 201

@water_sources_bp.route('/<int:source_id>/update-status', methods=['POST'])
@jwt_required()
def update_source_status(source_id):
    """Update water source status"""
    claims = get_jwt()
    if claims.get('role') not in ('official', 'asha_worker', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403
    
    source = WaterSource.query.get(source_id)
    if not source:
        return jsonify({'error': 'Water source not found'}), 404
    
    data = request.get_json()
    
    source.status = data.get('status', source.status)
    source.ph_level = data.get('ph_level', source.ph_level)
    source.turbidity = data.get('turbidity', source.turbidity)
    source.bacterial_count = data.get('bacterial_count', source.bacterial_count)
    source.last_tested = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({'message': 'Water source updated', 'source': source.to_dict()}), 200

@water_sources_bp.route('/status/<district>', methods=['GET'])
@jwt_required()
def get_district_water_status(district):
    """Get water source status summary for a district"""
    sources = WaterSource.query.filter_by(district=district).all()
    
    status_counts = {
        'safe': 0,
        'contaminated': 0,
        'inspection': 0,
        'unknown': 0,
    }
    
    for source in sources:
        status_counts[source.status] = status_counts.get(source.status, 0) + 1
    
    return jsonify({
        'district': district,
        'total_sources': len(sources),
        'status_breakdown': status_counts,
        'sources': [s.to_dict() for s in sources],
    }), 200

@water_sources_bp.route('/critical', methods=['GET'])
@jwt_required()
def get_critical_water_sources():
    """Get all contaminated or inspection water sources"""
    sources = WaterSource.query.filter(
        WaterSource.status.in_(['contaminated', 'inspection'])
    ).all()
    
    return jsonify([source.to_dict() for source in sources]), 200

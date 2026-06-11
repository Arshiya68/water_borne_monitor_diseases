from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.location import District, Tehsil

locations_bp = Blueprint('locations', __name__)

TELANGANA_DISTRICTS = [
    {'name': 'Adilabad', 'lat': 19.6633, 'lon': 78.5314},
    {'name': 'Bhadradri Kothagudem', 'lat': 17.6869, 'lon': 80.5744},
    {'name': 'Hyderabad', 'lat': 17.3850, 'lon': 78.4867},
    {'name': 'Jagtial', 'lat': 18.7639, 'lon': 78.6294},
    {'name': 'Jangaon', 'lat': 17.3430, 'lon': 78.7931},
    {'name': 'Kamareddy', 'lat': 18.3101, 'lon': 78.3410},
    {'name': 'Karimnagar', 'lat': 18.4386, 'lon': 78.1343},
    {'name': 'Khammam', 'lat': 17.2687, 'lon': 80.6162},
    {'name': 'Mahabubabad', 'lat': 17.6564, 'lon': 80.0642},
    {'name': 'Mahbubnagar', 'lat': 16.7384, 'lon': 77.5641},
    {'name': 'Mancherial', 'lat': 18.7343, 'lon': 78.4101},
    {'name': 'Medak', 'lat': 18.6298, 'lon': 77.4287},
    {'name': 'Medchal-Malkajgiri', 'lat': 17.5589, 'lon': 78.5694},
    {'name': 'Miryalaguda', 'lat': 17.2635, 'lon': 79.1298},
    {'name': 'Mulugu', 'lat': 18.3398, 'lon': 79.9159},
    {'name': 'Nalgonda', 'lat': 17.0593, 'lon': 79.1305},
    {'name': 'Narayanpet', 'lat': 16.5988, 'lon': 77.8667},
    {'name': 'Nirmal', 'lat': 19.1389, 'lon': 78.3744},
    {'name': 'Nizamabad', 'lat': 19.2941, 'lon': 78.0939},
    {'name': 'Peddapalli', 'lat': 18.5957, 'lon': 78.9263},
    {'name': 'Rajanna Sircilla', 'lat': 18.5941, 'lon': 78.4701},
    {'name': 'Ranga Reddy', 'lat': 17.6869, 'lon': 78.4472},
    {'name': 'Sangareddy', 'lat': 17.4933, 'lon': 77.9157},
    {'name': 'Siddipet', 'lat': 18.7137, 'lon': 78.8278},
    {'name': 'Suryapet', 'lat': 17.1114, 'lon': 79.9013},
    {'name': 'Vikarabad', 'lat': 17.3331, 'lon': 77.8633},
    {'name': 'Wanaparthy', 'lat': 16.4567, 'lon': 77.2842},
    {'name': 'Warangal', 'lat': 17.9689, 'lon': 79.5941},
    {'name': 'Yellandu', 'lat': 17.4667, 'lon': 80.3833},
    {'name': 'Yadadri Bhuvanagiri', 'lat': 17.6869, 'lon': 79.1305},
]

@locations_bp.route('/districts', methods=['GET'])
def get_all_districts():
    """Get all Telangana districts"""
    try:
        districts = District.query.all()
        
        if not districts:
            return jsonify(TELANGANA_DISTRICTS), 200
        
        return jsonify([d.to_dict() for d in districts]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@locations_bp.route('/district/<int:district_id>/tehsils', methods=['GET'])
def get_district_tehsils(district_id):
    """Get all tehsils in a district"""
    try:
        tehsils = Tehsil.query.filter_by(district_id=district_id).all()
        return jsonify([t.to_dict() for t in tehsils]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@locations_bp.route('/district/name/<district_name>', methods=['GET'])
@jwt_required()
def get_district_by_name(district_name):
    """Get district details by name"""
    try:
        district = District.query.filter_by(name=district_name).first()
        if not district:
            return jsonify({'error': 'District not found'}), 404
        
        return jsonify(district.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@locations_bp.route('/initialize-districts', methods=['POST'])
def initialize_districts():
    """Initialize all Telangana districts"""
    try:
        District.query.delete()
        Tehsil.query.delete()
        db.session.commit()
        
        for dist_data in TELANGANA_DISTRICTS:
            district = District(
                name=dist_data['name'],
                latitude=dist_data['lat'],
                longitude=dist_data['lon'],
                state='Telangana'
            )
            db.session.add(district)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Districts initialized successfully',
            'districts_count': len(TELANGANA_DISTRICTS),
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
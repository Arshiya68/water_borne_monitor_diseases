from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import EmergencyLocation
import math

emergency_bp = Blueprint('emergency', __name__, url_prefix='/emergency')

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in km"""
    R = 6371  # Earth radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

@emergency_bp.route('/hospitals/<district>', methods=['GET'])
@jwt_required()
def get_hospitals(district):
    """Get hospitals in a specific district"""
    hospitals = EmergencyLocation.query.filter(
        EmergencyLocation.location_type == 'hospital',
        EmergencyLocation.district == district,
        EmergencyLocation.is_active == True
    ).all()
    
    if not hospitals:
        # Return mock hospitals for demo
        mock_hospitals = [
            {
                'id': 1,
                'name': 'District Government Hospital',
                'location_type': 'hospital',
                'address': 'Hospital Rd, Ward 2',
                'district': district,
                'phone_number': '+91 9876 543 210',
                'services': 'Emergency, 24/7 OPD, Pathology, Water-borne Diseases',
                'beds_available': 45,
                'is_24_7': True,
            }
        ]
        return jsonify(mock_hospitals), 200
    
    return jsonify([h.to_dict() for h in hospitals]), 200

@emergency_bp.route('/nearest-hospital', methods=['GET'])
@jwt_required()
def get_nearest_hospital():
    """Get nearest hospital based on user coordinates"""
    user_lat = request.args.get('lat', type=float)
    user_lon = request.args.get('lon', type=float)
    district = request.args.get('district')
    
    if not user_lat or not user_lon:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    
    hospitals = EmergencyLocation.query.filter(
        EmergencyLocation.location_type == 'hospital',
        EmergencyLocation.district == district,
        EmergencyLocation.is_active == True
    ).all()
    
    if not hospitals:
        # Return mock nearest hospital
        return jsonify({
            'name': 'District Government Hospital',
            'address': 'Hospital Rd, Ward 2',
            'phone_number': '+91 9876 543 210',
            'distance': 2.3,
            'time': '8 mins',
            'services': ['Emergency', '24/7 OPD', 'Pathology'],
            'beds': 'Available',
            'availability': 'Open Now',
        }), 200
    
    # Calculate distances
    hospitals_with_distance = []
    for h in hospitals:
        if h.latitude and h.longitude:
            distance = haversine_distance(user_lat, user_lon, h.latitude, h.longitude)
            h_dict = h.to_dict()
            h_dict['distance_km'] = round(distance, 1)
            hospitals_with_distance.append(h_dict)
    
    # Sort by distance
    hospitals_with_distance.sort(key=lambda x: x['distance_km'])
    
    return jsonify(hospitals_with_distance[:5]), 200  # Return top 5 nearest

@emergency_bp.route('/water-distribution/<district>', methods=['GET'])
@jwt_required()
def get_water_distribution_points(district):
    """Get safe water distribution points in a district"""
    points = EmergencyLocation.query.filter(
        EmergencyLocation.location_type == 'water_distribution',
        EmergencyLocation.district == district,
        EmergencyLocation.is_active == True
    ).all()
    
    if not points:
        # Return mock distribution points
        mock_points = [
            {
                'id': 1,
                'name': 'Tanker Distribution Point 1',
                'location': 'Ward 1 - Main Square',
                'distance': 0.5,
                'time': '2 mins',
                'availability': '09:00 - 18:00',
                'capacity': '5000 L',
            },
            {
                'id': 2,
                'name': 'Water Distribution Center',
                'location': 'Ward 2 - Community Hall',
                'distance': 1.2,
                'time': '5 mins',
                'availability': '08:00 - 20:00',
                'capacity': '10000 L',
            },
            {
                'id': 3,
                'name': 'Relief Camp Distribution',
                'location': 'Ward 3 - School Ground',
                'distance': 0.8,
                'time': '3 mins',
                'availability': '24/7 Emergency',
                'capacity': 'Unlimited',
            },
        ]
        return jsonify(mock_points), 200
    
    return jsonify([p.to_dict() for p in points]), 200

@emergency_bp.route('/add', methods=['POST'])
@jwt_required()
def add_emergency_location():
    """Add a new emergency location (officials only)"""
    claims = get_jwt()
    if claims.get('role') not in ('official', 'admin'):
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    required_fields = ['name', 'location_type', 'address', 'district', 'state']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    location = EmergencyLocation(
        name=data['name'],
        location_type=data['location_type'],
        address=data['address'],
        village=data.get('village'),
        district=data['district'],
        state=data['state'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        phone_number=data.get('phone_number'),
        phone_number_2=data.get('phone_number_2'),
        email=data.get('email'),
        services=data.get('services'),
        beds_available=data.get('beds_available'),
        is_24_7=data.get('is_24_7', True),
        capacity=data.get('capacity'),
        operating_hours=data.get('operating_hours'),
    )
    
    db.session.add(location)
    db.session.commit()
    
    return jsonify({'message': 'Location added', 'id': location.id}), 201

@emergency_bp.route('/health-clinics/<district>', methods=['GET'])
@jwt_required()
def get_health_clinics(district):
    """Get health clinics in a district"""
    clinics = EmergencyLocation.query.filter(
        EmergencyLocation.location_type == 'health_clinic',
        EmergencyLocation.district == district,
        EmergencyLocation.is_active == True
    ).all()
    
    return jsonify([c.to_dict() for c in clinics]), 200

@emergency_bp.route('/emergency-contacts', methods=['GET'])
@jwt_required()
def get_emergency_contacts():
    """Get standard emergency contact numbers"""
    contacts = [
        {'service': 'Ambulance', 'number': '102', 'availability': '24/7'},
        {'service': 'Health Helpline', 'number': '+91 9000 123 456', 'availability': '24/7'},
        {'service': 'Poison Control', 'number': '+91 9700 123 456', 'availability': 'On Call'},
    ]
    
    return jsonify(contacts), 200

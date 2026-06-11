from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import SymptomReport, WaterQuality
from datetime import datetime, timedelta

risk_prediction_bp = Blueprint('risk_prediction', __name__, url_prefix='/risk')

def calculate_risk_score(district):
    """Calculate risk score based on recent reports and water quality"""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    
    # Get recent reports
    recent_reports = SymptomReport.query.filter(
        SymptomReport.district == district,
        SymptomReport.submitted_at >= week_ago
    ).all()
    
    case_count = len(recent_reports)
    
    # Get water quality data
    water_quality = WaterQuality.query.filter_by(district=district).order_by(
        WaterQuality.recorded_year.desc(),
        WaterQuality.recorded_month.desc()
    ).first()
    
    # Base risk calculation
    risk_score = 0
    
    # Cases contribution (0-40 points)
    if case_count > 0:
        risk_score += min(40, case_count * 5)
    
    # Water quality contribution (0-30 points)
    if water_quality:
        if water_quality.contamination_risk == 'High':
            risk_score += 30
        elif water_quality.contamination_risk == 'Medium':
            risk_score += 15
        # Low contamination adds 0
    
    # Trend contribution (0-30 points)
    month_ago = now - timedelta(days=30)
    cases_30_days = SymptomReport.query.filter(
        SymptomReport.district == district,
        SymptomReport.submitted_at >= month_ago
    ).count()
    
    if cases_30_days > case_count * 2:
        risk_score += 30  # Cases increasing
    elif cases_30_days > case_count:
        risk_score += 15  # Cases stable
    
    risk_score = min(100, risk_score)
    
    # Determine risk level
    if risk_score >= 70:
        level = 'High'
    elif risk_score >= 50:
        level = 'Moderate'
    else:
        level = 'Low'
    
    return {
        'score': risk_score,
        'level': level,
        'cases_7d': case_count,
        'cases_30d': cases_30_days,
    }

@risk_prediction_bp.route('/<district>', methods=['GET'])
@jwt_required()
def get_risk_prediction(district):
    """Get risk prediction for a specific district"""
    try:
        risk_data = calculate_risk_score(district)
        
        factors = []
        if risk_data['cases_7d'] > 5:
            factors.append({'factor': 'Recent Cases', 'value': risk_data['cases_7d'], 'status': 'high'})
        else:
            factors.append({'factor': 'Recent Cases', 'value': risk_data['cases_7d'], 'status': 'low'})
        
        # Get water quality
        water_quality = WaterQuality.query.filter_by(district=district).order_by(
            WaterQuality.recorded_year.desc(),
            WaterQuality.recorded_month.desc()
        ).first()
        
        if water_quality:
            wq_status = 'good' if water_quality.contamination_risk == 'Low' else 'warning'
            factors.append({'factor': 'Water Quality', 'value': water_quality.contamination_risk, 'status': wq_status})
        
        factors.append({'factor': 'Rainfall', 'value': 'Normal', 'status': 'normal'})
        
        return jsonify({
            'area': district,
            'level': risk_data['level'],
            'score': risk_data['score'],
            'factors': factors,
            'cases_7d': risk_data['cases_7d'],
            'cases_30d': risk_data['cases_30d'],
            'recommendations': get_recommendations(risk_data['level']),
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@risk_prediction_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_district_risks():
    """Get risk predictions for all districts"""
    districts = [
        'Hyderabad', 'Ranga Reddy', 'Medchal-Malkajgiri', 'Nalgonda', 'Warangal Urban',
        'Warangal Rural', 'Vikarabad', 'Karimnagar', 'Rajahmundry', 'Kakinada',
        'Nizamabad', 'Kamareddy', 'Adilabad', 'Nirmal', 'Khammam',
        'Mahbubnagar', 'Nagarkurnool', 'Wanaparthy'
    ]
    
    risks = {}
    for district in districts:
        risks[district] = calculate_risk_score(district)
    
    return jsonify(risks), 200

def get_recommendations(risk_level):
    """Get recommendations based on risk level"""
    if risk_level == 'High':
        return [
            'Increase surveillance in affected areas',
            'Prepare health worker response teams',
            'Distribute prevention education materials',
            'Test all water sources immediately'
        ]
    elif risk_level == 'Moderate':
        return [
            'Monitor the situation closely',
            'Educate community on prevention',
            'Test key water sources',
            'Prepare emergency response'
        ]
    else:
        return [
            'Continue regular water monitoring',
            'Maintain health awareness programs',
            'Regular community engagement'
        ]

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.symptom_report import SymptomReport
from app.models.water_quality import WaterQuality
from datetime import datetime, timedelta
from sqlalchemy import func
import json



analytics_bp = Blueprint('analytics', __name__)

TELANGANA_DISTRICTS = [
    "Hyderabad", "Ranga Reddy", "Medchal-Malkajgiri", "Nalgonda",
    "Warangal Urban", "Warangal Rural", "Vikarabad", "Karimnagar",
    "Rajahmundry", "Kakinada", "Nizamabad", "Kamareddy",
    "Adilabad", "Nirmal", "Khammam", "Mahbubnagar",
    "Nagarkurnool", "Wanaparthy",
]

@analytics_bp.route('/statistics', methods=['GET'])
@jwt_required()
def statistics():
    """Get overall statistics"""
    try:
        total_reports = SymptomReport.query.count()
        verified_reports = SymptomReport.query.filter_by(verified=True).count()
        total_users = User.query.count()
        
        high_risk = SymptomReport.query.filter_by(predicted_risk='High').count()
        medium_risk = SymptomReport.query.filter_by(predicted_risk='Medium').count()
        low_risk = SymptomReport.query.filter_by(predicted_risk='Low').count()
        
        affected_districts = db.session.query(
            func.count(func.distinct(SymptomReport.district))
        ).scalar() or 0
        symptom_distribution = {
            'diarrhea': SymptomReport.query.filter(SymptomReport.diarrhea > 0).count(),
            'vomiting': SymptomReport.query.filter(SymptomReport.vomiting > 0).count(),
            'fever': SymptomReport.query.filter(SymptomReport.fever > 0).count(),
            'abdominal_pain': SymptomReport.query.filter(SymptomReport.abdominal_pain > 0).count(),
            'dehydration': SymptomReport.query.filter(SymptomReport.dehydration > 0).count(),
        }
        water_source_distribution = {
            'Tap': SymptomReport.query.filter_by(water_source=0).count(),
            'Borewell': SymptomReport.query.filter_by(water_source=1).count(),
            'Tank': SymptomReport.query.filter_by(water_source=2).count(),
            'River': SymptomReport.query.filter_by(water_source=3).count(),
        }
        high_risk_areas = db.session.query(
            func.count(func.distinct(SymptomReport.district))
        ).filter(SymptomReport.predicted_risk == 'High').scalar() or 0

        return jsonify({
            'total_reports': total_reports,
            'total_users': total_users,
            'verified_reports': verified_reports,
            'verification_rate': round((verified_reports / total_reports * 100) if total_reports > 0 else 0, 2),
            'high_risk_cases': high_risk,
            'medium_risk_cases': medium_risk,
            'low_risk_cases': low_risk,
            'affected_districts': affected_districts,
            'high_risk_areas': high_risk_areas,
            'symptom_distribution': symptom_distribution,
            'water_source_distribution': water_source_distribution,
        }), 200
    except Exception as e:
        print(f"Error in statistics: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/districts', methods=['GET'])
@jwt_required()
def get_all_districts():
    """Get all districts with risk data"""
    try:
        districts_list = []
        
        for district_name in TELANGANA_DISTRICTS:
            reports = SymptomReport.query.filter_by(district=district_name).all()
            water_quality = WaterQuality.query.filter_by(district=district_name).order_by(
                WaterQuality.recorded_year.desc()
            ).first()
            
            if reports:
                high_count = len([r for r in reports if r.predicted_risk == 'High'])
                medium_count = len([r for r in reports if r.predicted_risk == 'Medium'])
                low_count = len([r for r in reports if r.predicted_risk == 'Low'])
                
                if high_count > 0:
                    risk = 'High'
                    color = '#EF4444'
                elif medium_count > 0:
                    risk = 'Medium'
                    color = '#F59E0B'
                else:
                    risk = 'Low'
                    color = '#10B981'
                
                risk_pct = (high_count / len(reports)) * 100 if reports else 0
            else:
                risk = 'Low'
                color = '#10B981'
                high_count = medium_count = low_count = 0
                risk_pct = 0
            
            water_idx = water_quality.water_quality_index if water_quality else 50
            
            districts_list.append({
                'name': district_name,
                'total_reports': len(reports),
                'high_risk': high_count,
                'medium_risk': medium_count,
                'low_risk': low_count,
                'overall_risk': risk,
                'risk_color': color,
                'risk_percentage': round(risk_pct, 2),
                'water_quality': water_idx,
            })
        
        return jsonify(districts_list), 200
    except Exception as e:
        print(f"Error in districts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/district/<district_name>/details', methods=['GET'])
@jwt_required()
def get_district_details(district_name):
    """Get detailed data for a district"""
    try:
        if district_name not in TELANGANA_DISTRICTS:
            return jsonify({'error': 'District not found'}), 404
        
        reports = SymptomReport.query.filter_by(district=district_name).all()
        water_quality = WaterQuality.query.filter_by(district=district_name).order_by(
            WaterQuality.recorded_year.desc()
        ).first()
        
        total = len(reports)
        verified = len([r for r in reports if r.verified])
        
        symptoms = {
            'diarrhea': len([r for r in reports if r.diarrhea]),
            'vomiting': len([r for r in reports if r.vomiting]),
            'fever': len([r for r in reports if r.fever]),
            'abdominal_pain': len([r for r in reports if r.abdominal_pain]),
            'dehydration': len([r for r in reports if r.dehydration]),
        }
        
        water_sources = {
            'Tap': len([r for r in reports if r.water_source == 0]),
            'Borewell': len([r for r in reports if r.water_source == 1]),
            'Tank': len([r for r in reports if r.water_source == 2]),
            'River': len([r for r in reports if r.water_source == 3]),
        }
        
        diseases = {}
        for r in reports:
            if r.diagnosis:
                diseases[r.diagnosis] = diseases.get(r.diagnosis, 0) + 1
        
        risk_dist = {
            'Low': len([r for r in reports if r.predicted_risk == 'Low']),
            'Medium': len([r for r in reports if r.predicted_risk == 'Medium']),
            'High': len([r for r in reports if r.predicted_risk == 'High']),
        }
        
        if total > 0:
            risk_pct = (risk_dist['High'] / total) * 100
        else:
            risk_pct = 0
        
        return jsonify({
            'district': district_name,
            'total_cases': total,
            'verified_cases': verified,
            'verification_rate': round((verified / total * 100) if total > 0 else 0, 2),
            'risk_percentage': round(risk_pct, 2),
            'symptoms': symptoms,
            'water_sources': water_sources,
            'diseases': diseases,
            'risk_distribution': risk_dist,
            'water_quality': water_quality.water_quality_index if water_quality else None,
        }), 200
    except Exception as e:
        print(f"Error in district details: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/weekly-trend', methods=['GET'])
@jwt_required()
def get_weekly_trend():
    """Get weekly risk trend"""
    try:
        today = datetime.utcnow()
        week_ago = today - timedelta(days=7)
        
        trends = []
        for i in range(7):
            date = (week_ago + timedelta(days=i)).date()
            next_date = date + timedelta(days=1)
            
            day_reports = SymptomReport.query.filter(
                SymptomReport.submitted_at >= f"{date}",
                SymptomReport.submitted_at < f"{next_date}"
            ).all()
            
            high = len([r for r in day_reports if r.predicted_risk == 'High'])
            medium = len([r for r in day_reports if r.predicted_risk == 'Medium'])
            low = len([r for r in day_reports if r.predicted_risk == 'Low'])
            
            if len(day_reports) > 0:
                risk_pct = (high / len(day_reports)) * 100
            else:
                risk_pct = 0
            
            trends.append({
                'date': str(date),
                'day': date.strftime('%A'),
                'total': len(day_reports),
                'high_risk': high,
                'medium_risk': medium,
                'low_risk': low,
                'risk_percentage': round(risk_pct, 2),
            })
        
        return jsonify(trends), 200
    except Exception as e:
        print(f"Error in weekly trend: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/trends/<string:period>', methods=['GET'])
@jwt_required()
def get_trend_by_period(period):
    """Get trend data for week/month/year"""
    try:
        today = datetime.utcnow().date()

        if period == 'week':
            start_date = today - timedelta(days=6)
            date_format = '%Y-%m-%d'
            labels = [(start_date + timedelta(days=i)) for i in range(7)]
        elif period == 'month':
            start_date = today - timedelta(days=29)
            date_format = '%Y-%m-%d'
            labels = [(start_date + timedelta(days=i)) for i in range(30)]
        elif period == 'year':
            date_format = '%Y-%m'
            labels = []
            start_date = today.replace(day=1) - timedelta(days=365)
            current = today.replace(day=1)
            while current >= start_date:
                labels.append(current)
                current = (current - timedelta(days=1)).replace(day=1)
            labels = list(reversed(labels))
        else:
            return jsonify({'error': 'Invalid trend period'}), 400

        reports = SymptomReport.query.filter(
            SymptomReport.submitted_at >= str(start_date),
            SymptomReport.submitted_at <= str(today + timedelta(days=1))
        ).all()

        trend_map = {}
        for report in reports:
            if period == 'year':
                key = report.submitted_at.strftime('%Y-%m')
            else:
                key = report.submitted_at.strftime('%Y-%m-%d')

            entry = trend_map.setdefault(key, {
                'date': key,
                'total_reports': 0,
                'verified': 0,
                'symptom_count': 0,
                'high_risk': 0,
                'medium_risk': 0,
                'low_risk': 0,
            })
            entry['total_reports'] += 1
            entry['verified'] += 1 if report.verified else 0
            entry['symptom_count'] += sum([
                int(report.diarrhea), int(report.vomiting), int(report.fever),
                int(report.abdominal_pain), int(report.dehydration)
            ])
            if report.predicted_risk == 'High':
                entry['high_risk'] += 1
            elif report.predicted_risk == 'Medium':
                entry['medium_risk'] += 1
            else:
                entry['low_risk'] += 1

        results = []
        for label in labels:
            key = label.strftime(date_format)
            if key in trend_map:
                results.append(trend_map[key])
            else:
                results.append({
                    'date': key,
                    'total_reports': 0,
                    'verified': 0,
                    'symptom_count': 0,
                    'high_risk': 0,
                    'medium_risk': 0,
                    'low_risk': 0,
                })

        return jsonify(results), 200
    except Exception as e:
        print(f"Error in trend by period: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/hotspot-map', methods=['GET'])
@jwt_required()
def get_hotspot_map():
    """Get hotspot data for map clustered by village/coordinates"""
    try:
        from sqlalchemy import func
        results = db.session.query(
            SymptomReport.village,
            SymptomReport.district,
            SymptomReport.latitude,
            SymptomReport.longitude,
            func.count(SymptomReport.id).label('total_cases'),
            func.sum(func.cast(SymptomReport.verified, db.Integer)).label('verified_cases'),
        ).filter(
            SymptomReport.latitude.isnot(None),
            SymptomReport.longitude.isnot(None)
        ).group_by(
            SymptomReport.village,
            SymptomReport.district,
            SymptomReport.latitude,
            SymptomReport.longitude
        ).all()

        hotspots = []
        for r in results:
            high_count = SymptomReport.query.filter_by(village=r[0], predicted_risk='High').count()
            medium_count = SymptomReport.query.filter_by(village=r[0], predicted_risk='Medium').count()
            
            if high_count > 0:
                risk_level = 'High'
                color = '#EF4444' # Red
            elif medium_count > 0:
                risk_level = 'Medium'
                color = '#F59E0B' # Orange/Yellow
            else:
                risk_level = 'Low'
                color = '#10B981' # Green

            hotspots.append({
                'village': r[0],
                'district': r[1],
                'latitude': r[2],
                'longitude': r[3],
                'total_cases': r[4],
                'verified_cases': int(r[5] or 0),
                'risk_level': risk_level,
                'color': color
            })
        
        return jsonify(hotspots), 200
    except Exception as e:
        print(f"Error in hotspot: {str(e)}")
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/ml-analysis/<district_name>', methods=['GET'])
@jwt_required()
def ml_analysis(district_name):
    """Aggregate environmental & symptom statistics and compute ML Outbreak Prediction & Drivers"""
    try:
        from app.ml.predict import predict_risk
        
        # Get reports in the district
        reports = SymptomReport.query.filter_by(district=district_name).all()
        # Get water quality in district
        wq = WaterQuality.query.filter_by(district=district_name).order_by(WaterQuality.recorded_year.desc(), WaterQuality.recorded_month.desc()).first()
        
        n_reports = len(reports)
        inp = {
            'turbidity': wq.turbidity if wq else 2.0,
            'chlorophyll_a': wq.chlorophyll_a if wq else 5.0,
            'nitrates': wq.nitrates if wq else 4.0,
            'sulphates': wq.sulphates if wq else 50.0,
            'ph': wq.ph_level if wq else 7.2,
            'dissolved_oxygen': wq.dissolved_oxygen if wq else 7.5,
            'total_suspended_solids': wq.total_suspended_solids if wq else 12.0,
            'diarrhea': sum(r.diarrhea for r in reports) / max(1, n_reports),
            'vomiting': sum(r.vomiting for r in reports) / max(1, n_reports),
            'fever': sum(r.fever for r in reports) / max(1, n_reports),
            'abdominal_pain': sum(r.abdominal_pain for r in reports) / max(1, n_reports),
            'dehydration': sum(r.dehydration for r in reports) / max(1, n_reports),
            'water_source': reports[0].water_source if reports else 0,
            'household_affected': sum(r.household_affected for r in reports) / max(1, n_reports),
            'age_group': 1,
            'symptom_duration': 2,
        }
        
        # Predict using ML model
        prediction = predict_risk(inp)
        
        # Calculate feature driver scores (normalize each contribution relative to healthy threshold)
        drivers = []
        
        # Environmental drivers
        if wq:
            if wq.turbidity > 5:
                drivers.append({'name': 'Turbidity (Water Quality)', 'impact': round(min(100, (wq.turbidity / 5.0) * 20), 1)})
            if abs(wq.ph_level - 7.0) > 1.0:
                drivers.append({'name': 'pH Abnormality (Water Quality)', 'impact': round(min(100, abs(wq.ph_level - 7.0) * 25), 1)})
            if wq.nitrates > 10:
                drivers.append({'name': 'Nitrates Level (Chemical Contamination)', 'impact': round(min(100, (wq.nitrates / 10.0) * 15), 1)})
            if wq.dissolved_oxygen < 5:
                drivers.append({'name': 'Dissolved Oxygen Deficit', 'impact': round(min(100, (5.0 / max(0.1, wq.dissolved_oxygen)) * 20), 1)})
                
        # Symptom drivers
        if n_reports > 0:
            diarrhea_pct = sum(r.diarrhea for r in reports) / n_reports
            vomiting_pct = sum(r.vomiting for r in reports) / n_reports
            fever_pct = sum(r.fever for r in reports) / n_reports
            
            if diarrhea_pct > 0.05:
                drivers.append({'name': 'Reported Diarrhea Cases', 'impact': round(diarrhea_pct * 100, 1)})
            if vomiting_pct > 0.05:
                drivers.append({'name': 'Reported Vomiting Cases', 'impact': round(vomiting_pct * 100, 1)})
            if fever_pct > 0.05:
                drivers.append({'name': 'Reported Fever Cases', 'impact': round(fever_pct * 100, 1)})
                
        # Default driver if empty
        if not drivers:
            drivers.append({'name': 'Baseline Environmental Conditions', 'impact': 10.0})
            
        drivers = sorted(drivers, key=lambda x: x['impact'], reverse=True)[:5]
        
        return jsonify({
            'district': district_name,
            'prediction': prediction,
            'drivers': drivers,
            'total_cases_analyzed': n_reports,
            'water_quality_index': wq.water_quality_index if wq else 80.0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.symptom_report import SymptomReport
from app.models.water_quality import WaterQuality
from app.models.notification import Notification
from app.ml.predict import predict_risk, calculate_village_risk
from app.utils.notifications import send_alerts_to_users
from datetime import datetime, timedelta

reports_bp = Blueprint('reports', __name__)


def get_user_info(user_id):
    if not user_id:
        return None
    user = User.query.get(user_id)
    if not user:
        return None
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
    }


def serialize_report(report):
    data = report.to_dict()
    data['submitted_by'] = get_user_info(report.user_id)
    data['verified_by'] = get_user_info(report.verified_by_id)
    return data


@reports_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_report():
    """Submit symptom report"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        water_quality_row = WaterQuality.query.filter_by(village=user.village).order_by(
            WaterQuality.recorded_year.desc(),
            WaterQuality.recorded_month.desc()
        ).first()

        def select_field(name, default):
            if name in data and data[name] is not None:
                return data[name]
            if water_quality_row and hasattr(water_quality_row, name):
                value = getattr(water_quality_row, name)
                if value is not None:
                    return value
            return default

        ph_value = data.get('ph')
        if ph_value is None and water_quality_row is not None:
            ph_value = getattr(water_quality_row, 'ph_level', None)

        prediction_input = {
            'turbidity': select_field('turbidity', 0),
            'chlorophyll_a': select_field('chlorophyll_a', 0),
            'nitrates': select_field('nitrates', 0),
            'sulphates': select_field('sulphates', 0),
            'ph': ph_value if ph_value is not None else 7.0,
            'dissolved_oxygen': select_field('dissolved_oxygen', 6.0),
            'total_suspended_solids': select_field('total_suspended_solids', 0),
            'diarrhea': data.get('diarrhea', 0),
            'vomiting': data.get('vomiting', 0),
            'fever': data.get('fever', 0),
            'abdominal_pain': data.get('abdominal_pain', 0),
            'dehydration': data.get('dehydration', 0),
            'water_source': data.get('water_source', 0),
            'household_affected': data.get('household_affected', 1),
            'age_group': data.get('age_group', 1),
            'symptom_duration': data.get('symptom_duration', 1),
        }

        prediction = predict_risk(prediction_input)

        report = SymptomReport(
            user_id=user_id,
            # Use location from request data (GIS map) if provided, else from user profile
            village=data.get('village') or user.village,
            district=data.get('district') or user.district,
            state=data.get('state') or user.state,
            latitude=data.get('latitude') or user.latitude,
            longitude=data.get('longitude') or user.longitude,
            diarrhea=data.get('diarrhea', 0),
            vomiting=data.get('vomiting', 0),
            fever=data.get('fever', 0),
            abdominal_pain=data.get('abdominal_pain', 0),
            dehydration=data.get('dehydration', 0),
            diarrhea_severity=data.get('diarrhea_severity', 1),
            fever_severity=data.get('fever_severity', 1),
            water_source=data.get('water_source', 0),
            household_affected=data.get('household_affected', 1),
            age_group=data.get('age_group', 1),
            predicted_risk=prediction.get('risk_level', 'Low'),
            risk_confidence=prediction.get('probability', 0.0),
            water_quality_score=round(prediction.get('water_quality_score', prediction.get('probability', 0.0) * 100), 2),
        )

        db.session.add(report)
        db.session.commit()

        alert_data = None
        
        # 1. High risk assessment alert
        if prediction.get('risk_level') == 'High':
            try:
                alert_message = (
                    f"HEALTH ALERT [High Risk]: The area around {report.village}, {report.district} "
                    "is showing high outbreak risk. Please use safe water, avoid unsafe sources, and contact local health services."
                )
                alert_record = Notification(
                    sender_id=user_id,
                    village=report.village,
                    district=report.district,
                    risk_level='High',
                    message=alert_message,
                    created_at=datetime.utcnow(),
                )
                db.session.add(alert_record)
                db.session.commit()

                users = User.query.filter_by(district=report.district, is_active=True).all()
                user_dicts = [u.to_dict() for u in users]
                send_alerts_to_users(user_dicts, alert_message)
                alert_data = alert_record.to_dict()
            except Exception as alert_err:
                db.session.rollback()
                print(f"High risk alert error: {alert_err}")

        # 2. Cluster outbreak alert (3+ cases in same village or district within 7 days)
        try:
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            # Count reports in the same village
            village_cases = SymptomReport.query.filter(
                SymptomReport.village == report.village,
                SymptomReport.district == report.district,
                SymptomReport.submitted_at >= seven_days_ago
            ).count()

            # Count reports in the same district
            district_cases = SymptomReport.query.filter(
                SymptomReport.district == report.district,
                SymptomReport.submitted_at >= seven_days_ago
            ).count()

            trigger_cluster_alert = False
            alert_loc_type = None
            case_count = 0

            if village_cases >= 3:
                trigger_cluster_alert = True
                alert_loc_type = 'Village'
                case_count = village_cases
            elif district_cases >= 3:
                trigger_cluster_alert = True
                alert_loc_type = 'District'
                case_count = district_cases

            if trigger_cluster_alert:
                # To prevent flood of automatic alerts, check if an automatic cluster alert was created in the last 24 hours
                one_day_ago = datetime.utcnow() - timedelta(days=1)
                existing_auto_alert = Notification.query.filter(
                    Notification.district == report.district,
                    Notification.message.like('%AUTOMATIC OUTBREAK WARNING%'),
                    Notification.created_at >= one_day_ago
                ).filter(
                    (Notification.village == report.village) if alert_loc_type == 'Village' else True
                ).first()

                if not existing_auto_alert:
                    loc_name = f"village {report.village} ({report.district})" if alert_loc_type == 'Village' else f"district {report.district}"
                    auto_message = (
                        f"⚠️ AUTOMATIC OUTBREAK WARNING: Cluster of {case_count} cases detected in "
                        f"{loc_name} in the last 7 days. Possible outbreak risk. "
                        f"Please boil water and notify ASHA workers."
                    )
                    auto_alert = Notification(
                        sender_id=user_id,
                        village=report.village if alert_loc_type == 'Village' else None,
                        district=report.district,
                        risk_level='High',
                        message=auto_message,
                        created_at=datetime.utcnow()
                    )
                    db.session.add(auto_alert)
                    db.session.commit()

                    users = User.query.filter_by(district=report.district, is_active=True).all()
                    user_dicts = [u.to_dict() for u in users]
                    send_alerts_to_users(user_dicts, auto_message)
                    alert_data = auto_alert.to_dict()
        except Exception as cluster_err:
            db.session.rollback()
            print(f"Cluster alert detection error: {cluster_err}")

        return jsonify({
            'message': 'Report submitted successfully',
            'report': serialize_report(report),
            'risk': prediction,
            'alert': alert_data,
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Submit report error: {str(e)}")
        return jsonify({'error': 'Failed to submit report'}), 500


@reports_bp.route('/list', methods=['GET'])
@jwt_required()
def list_reports():
    """Get user's reports"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role in ['official', 'admin', 'asha_worker']:
            reports = SymptomReport.query.order_by(SymptomReport.submitted_at.desc()).all()
        else:
            reports = SymptomReport.query.filter_by(user_id=user_id).order_by(SymptomReport.submitted_at.desc()).all()

        return jsonify([serialize_report(report) for report in reports]), 200

    except Exception as e:
        print(f"List reports error: {str(e)}")
        return jsonify({'error': 'Failed to get reports'}), 500


@reports_bp.route('/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    """Get a report by ID for owner or high-role users"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        report = SymptomReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404

        if report.user_id != user_id and user.role not in ['official', 'admin', 'asha_worker']:
            return jsonify({'error': 'Not authorized to view this report'}), 403

        report_data = serialize_report(report)

        since = datetime.utcnow() - timedelta(days=7)
        wq = WaterQuality.query.filter(
            WaterQuality.village == report.village,
        ).order_by(
            WaterQuality.recorded_year.desc(),
            WaterQuality.recorded_month.desc()
        ).first()
        recent_reports = SymptomReport.query.filter(
            SymptomReport.village == report.village,
            SymptomReport.submitted_at >= since
        ).all()

        if wq or recent_reports:
            report_data['village_risk'] = calculate_village_risk(
                report.village,
                wq.to_dict() if wq else None,
                recent_reports,
            )

        return jsonify(report_data), 200

    except Exception as e:
        print(f"Get report error: {str(e)}")
        return jsonify({'error': 'Failed to get report'}), 500


@reports_bp.route('/<int:report_id>', methods=['PATCH'])
@jwt_required()
def update_report(report_id):
    """Update user's own report before verification"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        report = SymptomReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404

        if report.user_id != user_id:
            return jsonify({'error': 'Not authorized to update this report'}), 403

        if report.verified:
            return jsonify({'error': 'Verified reports cannot be updated'}), 400

        data = request.get_json() or {}
        for field in [
            'diarrhea', 'vomiting', 'fever', 'abdominal_pain', 'dehydration',
            'diarrhea_severity', 'fever_severity', 'water_source',
            'household_affected', 'age_group', 'latitude', 'longitude',
        ]:
            if field in data:
                setattr(report, field, data[field])

        prediction_input = {
            'turbidity': data.get('turbidity', 0),
            'chlorophyll_a': data.get('chlorophyll_a', 0),
            'nitrates': data.get('nitrates', 0),
            'sulphates': data.get('sulphates', 0),
            'ph': data.get('ph', 7.0),
            'dissolved_oxygen': data.get('dissolved_oxygen', 6.0),
            'total_suspended_solids': data.get('total_suspended_solids', 0),
            'diarrhea': data.get('diarrhea', report.diarrhea),
            'vomiting': data.get('vomiting', report.vomiting),
            'fever': data.get('fever', report.fever),
            'abdominal_pain': data.get('abdominal_pain', report.abdominal_pain),
            'dehydration': data.get('dehydration', report.dehydration),
            'water_source': data.get('water_source', report.water_source),
            'household_affected': data.get('household_affected', report.household_affected),
            'age_group': data.get('age_group', report.age_group),
            'symptom_duration': data.get('symptom_duration', 1),
        }

        prediction = predict_risk(prediction_input)
        report.predicted_risk = prediction.get('risk_level', report.predicted_risk)
        report.risk_confidence = prediction.get('probability', report.risk_confidence)
        report.water_quality_score = round(report.risk_confidence * 100, 2)

        db.session.commit()

        return jsonify({'message': 'Report updated', 'report': serialize_report(report)}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Update report error: {str(e)}")
        return jsonify({'error': 'Failed to update report'}), 500


@reports_bp.route('/verify/<int:report_id>', methods=['PATCH'])
@jwt_required()
def verify_report(report_id):
    """Verify report (ASHA worker, official, admin)"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role not in ['asha_worker', 'official', 'admin']:
            return jsonify({'error': 'Not authorized'}), 403

        report = SymptomReport.query.get(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404

        data = request.get_json() or {}
        report.verified = True
        report.verified_by_id = user_id
        report.diagnosis = data.get('diagnosis', report.diagnosis)
        report.referral_status = data.get('referral_status', report.referral_status)
        report.verified_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'message': 'Report verified',
            'report': serialize_report(report),
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Verify report error: {str(e)}")
        return jsonify({'error': 'Failed to verify report'}), 500
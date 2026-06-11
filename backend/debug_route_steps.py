import os
from dotenv import load_dotenv
load_dotenv()
from app import create_app, db
from app.models.user import User
from app.models.water_quality import WaterQuality
from app.ml.predict import predict_risk
from app.models.symptom_report import SymptomReport
from app.routes.reports import serialize_report, get_user_info

app = create_app()
with app.app_context():
    user = User.query.filter_by(email='testreport_1780726908@example.com').first()
    print('user', user and user.id, user and user.email)
    data = {
        'diarrhea': 1,
        'vomiting': 0,
        'fever': 1,
        'abdominal_pain': 0,
        'dehydration': 0,
        'diarrhea_severity': 2,
        'fever_severity': 2,
        'water_source': 0,
        'household_affected': 2,
        'age_group': 1,
        'symptom_duration': 3,
        'turbidity': 5,
        'ph': 7.2,
        'nitrates': 8,
        'dissolved_oxygen': 7,
        'chlorophyll_a': 4,
        'sulphates': 80,
        'total_suspended_solids': 15,
    }
    water_quality_row = WaterQuality.query.filter_by(village=user.village).order_by(WaterQuality.recorded_at.desc()).first()
    print('water_quality_row', water_quality_row)
    def select_field(name, default):
        if name in data and data[name] is not None:
            return data[name]
        if water_quality_row and hasattr(water_quality_row, name):
            value = getattr(water_quality_row, name)
            if value is not None:
                return value
        return default
    prediction_input = {
        'turbidity': select_field('turbidity', 0),
        'chlorophyll_a': select_field('chlorophyll_a', 0),
        'nitrates': select_field('nitrates', 0),
        'sulphates': select_field('sulphates', 0),
        'ph': select_field('ph', 7.0),
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
    print('prediction_input', prediction_input)
    prediction = predict_risk(prediction_input)
    print('prediction', prediction)
    report = SymptomReport(
        user_id=user.id,
        village=user.village,
        district=user.district,
        state=user.state,
        latitude=user.latitude,
        longitude=user.longitude,
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
    print('report id', report.id)
    report_data = serialize_report(report)
    print('serialized', report_data)

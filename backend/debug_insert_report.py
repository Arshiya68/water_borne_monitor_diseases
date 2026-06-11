import os
from dotenv import load_dotenv
load_dotenv()
from app import create_app, db
from app.models.symptom_report import SymptomReport
from app.models.user import User

app = create_app()
with app.app_context():
    user = User.query.filter_by(email='testreport_1780726908@example.com').first()
    print('found user', user and user.id)
    if not user:
        raise SystemExit('user missing')
    report = SymptomReport(
        user_id=user.id,
        village=user.village,
        district=user.district,
        state=user.state,
        latitude=user.latitude,
        longitude=user.longitude,
        diarrhea=1,
        vomiting=0,
        fever=1,
        abdominal_pain=0,
        dehydration=0,
        diarrhea_severity=2,
        fever_severity=2,
        water_source=0,
        household_affected=2,
        age_group=1,
        predicted_risk='Low',
        risk_confidence=0.7,
        water_quality_score=75.0,
    )
    db.session.add(report)
    try:
        db.session.commit()
        print('commit succeeded, report id', report.id)
    except Exception as e:
        db.session.rollback()
        print('commit failed', repr(e))
        raise

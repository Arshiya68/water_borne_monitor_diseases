from app import db
from datetime import datetime

class SymptomReport(db.Model):
    __tablename__ = 'symptom_reports'

    id                   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id              = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Location
    village              = db.Column(db.String(100), nullable=False, index=True)
    district             = db.Column(db.String(100), nullable=False)
    state                = db.Column(db.String(100), nullable=False)
    latitude             = db.Column(db.Float, nullable=True)
    longitude            = db.Column(db.Float, nullable=True)
    
    # Symptoms (0 or 1)
    diarrhea             = db.Column(db.Integer, default=0)
    vomiting             = db.Column(db.Integer, default=0)
    fever                = db.Column(db.Integer, default=0)
    abdominal_pain       = db.Column(db.Integer, default=0)
    dehydration          = db.Column(db.Integer, default=0)
    
    # Severity (1-5 scale)
    diarrhea_severity    = db.Column(db.Integer, default=1)
    fever_severity       = db.Column(db.Integer, default=1)
    
    # Water & Household
    water_source         = db.Column(db.Integer, default=0)  # 0=Tap, 1=Borewell, 2=River, 3=Pond
    household_affected   = db.Column(db.Integer, default=1)
    age_group            = db.Column(db.Integer, default=1)  # 0=Child, 1=Adult, 2=Elderly
    
    # ML Predictions
    predicted_risk       = db.Column(db.String(20), default='Low', index=True)
    risk_confidence      = db.Column(db.Float, default=0.0)
    water_quality_score  = db.Column(db.Float, default=50)
    
    # Verification
    verified             = db.Column(db.Boolean, default=False, index=True)
    verified_by_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    diagnosis            = db.Column(db.String(100), nullable=True)
    referral_status      = db.Column(db.Boolean, default=False)
    verified_at          = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    submitted_at         = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at           = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Alert
    alert_sent           = db.Column(db.Boolean, default=False)
    alert_sent_at        = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'submitted_at': self.submitted_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'verified': self.verified,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'verified_by_id': self.verified_by_id,
            'diagnosis': self.diagnosis,
            'predicted_risk': self.predicted_risk,
            'risk_confidence': self.risk_confidence,
            'water_quality_score': self.water_quality_score,
            'symptoms': {
                'diarrhea': self.diarrhea,
                'vomiting': self.vomiting,
                'fever': self.fever,
                'abdominal_pain': self.abdominal_pain,
                'dehydration': self.dehydration,
            },
            'diarrhea_severity': self.diarrhea_severity,
            'fever_severity': self.fever_severity,
            'water_source': self.water_source,
            'household_affected': self.household_affected,
            'age_group': self.age_group,
            'referral_status': self.referral_status,
            'alert_sent': self.alert_sent,
            'alert_sent_at': self.alert_sent_at.isoformat() if self.alert_sent_at else None,
        }

    def __repr__(self):
        return f'<SymptomReport {self.village} - {self.submitted_at}>'
from app import db
from datetime import datetime

class PredictionHistory(db.Model):
    __tablename__ = 'prediction_history'

    id              = db.Column(db.Integer, primary_key=True)
    village         = db.Column(db.String(100), nullable=False, index=True)
    district        = db.Column(db.String(100), nullable=False)
    state           = db.Column(db.String(100), nullable=False)
    latitude        = db.Column(db.Float, nullable=True)
    longitude       = db.Column(db.Float, nullable=True)

    # ML Prediction Results
    predicted_risk  = db.Column(db.String(20), nullable=False)  # Low/Medium/High
    confidence      = db.Column(db.Float, nullable=False)  # 0-1
    probability_low = db.Column(db.Float, default=0)
    probability_med = db.Column(db.Float, default=0)
    probability_high= db.Column(db.Float, default=0)

    # Input factors
    water_quality_score = db.Column(db.Float, nullable=True)
    symptom_count      = db.Column(db.Integer, default=0)
    verified_cases     = db.Column(db.Integer, default=0)

    # Alert triggered?
    alert_sent      = db.Column(db.Boolean, default=False)
    alert_message   = db.Column(db.Text, nullable=True)

    predicted_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'village': self.village,
            'district': self.district,
            'predicted_risk': self.predicted_risk,
            'confidence': self.confidence,
            'probabilities': {
                'low': self.probability_low,
                'medium': self.probability_med,
                'high': self.probability_high,
            },
            'alert_sent': self.alert_sent,
            'predicted_at': self.predicted_at.isoformat(),
        }
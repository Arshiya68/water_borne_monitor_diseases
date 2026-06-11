from app import db
from datetime import datetime

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    district = db.Column(db.String(100), nullable=False, index=True)
    village = db.Column(db.String(100), nullable=True)
    
    alert_type = db.Column(db.String(50), nullable=False)  # 'disease', 'water_contamination', 'safe_water', 'health_tip'
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='info')  # 'warning', 'info', 'success'
    
    recommendation = db.Column(db.Text, nullable=True)
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    read_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    created_by = db.Column(db.String(100), nullable=True)  # user_id or system
    
    def to_dict(self):
        return {
            'id': self.id,
            'district': self.district,
            'village': self.village,
            'alert_type': self.alert_type,
            'title': self.title,
            'message': self.message,
            'severity': self.severity,
            'recommendation': self.recommendation,
            'is_active': self.is_active,
            'timestamp': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Alert {self.title} - {self.severity}>'

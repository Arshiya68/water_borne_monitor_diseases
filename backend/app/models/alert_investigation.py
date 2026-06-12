from app import db
from datetime import datetime

class AlertInvestigation(db.Model):
    __tablename__ = 'alert_investigations'

    id                  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alert_id            = db.Column(db.Integer, db.ForeignKey('notifications.id'), nullable=False)
    asha_worker_id      = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    village             = db.Column(db.String(100), nullable=False)
    findings            = db.Column(db.Text)
    verification_status = db.Column(db.String(50), default='Pending')  # 'Pending', 'Under Investigation', 'Verified', 'Resolved', 'Rejected'
    visit_date          = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    alert = db.relationship('Notification', backref='investigations')
    asha_worker = db.relationship('User', backref='investigations')

    def to_dict(self):
        return {
            'id': self.id,
            'alert_id': self.alert_id,
            'alert_message': self.alert.message if self.alert else '',
            'asha_worker_id': self.asha_worker_id,
            'asha_worker_name': self.asha_worker.name if self.asha_worker else 'Unknown',
            'village': self.village,
            'findings': self.findings,
            'verification_status': self.verification_status,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
        }

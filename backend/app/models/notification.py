from app import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'

    id              = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id       = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    village         = db.Column(db.String(100), nullable=True, index=True)
    district        = db.Column(db.String(100), nullable=True, index=True)
    state           = db.Column(db.String(100), default='Telangana')
    risk_level      = db.Column(db.String(20), default='High')
    message         = db.Column(db.Text, nullable=False)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    sender = db.relationship('User', backref='sent_notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': self.sender.name if self.sender else 'System',
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'risk_level': self.risk_level,
            'message': self.message,
            'created_at': self.created_at.isoformat(),
        }

from app import db
from datetime import datetime

class HouseholdVisit(db.Model):
    __tablename__ = 'household_visits'

    id                 = db.Column(db.Integer, primary_key=True, autoincrement=True)
    asha_worker_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    household_name     = db.Column(db.String(100), nullable=False)
    village            = db.Column(db.String(100), nullable=False)
    family_members     = db.Column(db.Integer, default=1)
    water_source       = db.Column(db.String(50))
    sick_members_count = db.Column(db.Integer, default=0)
    symptoms           = db.Column(db.Text)  # Comma-separated list of observed symptoms
    status             = db.Column(db.String(50), default='Healthy')  # 'Healthy', 'Suspected Case', 'Confirmed Case'
    notes              = db.Column(db.Text)
    visit_date         = db.Column(db.DateTime, default=datetime.utcnow)
    follow_up_date     = db.Column(db.DateTime, nullable=True)

    # Relationships
    asha_worker = db.relationship('User', backref='field_visits')

    def to_dict(self):
        return {
            'id': self.id,
            'asha_worker_id': self.asha_worker_id,
            'asha_worker_name': self.asha_worker.name if self.asha_worker else 'Unknown',
            'household_name': self.household_name,
            'village': self.village,
            'family_members': self.family_members,
            'water_source': self.water_source,
            'sick_members_count': self.sick_members_count,
            'symptoms': self.symptoms,
            'status': self.status,
            'notes': self.notes,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
        }

from app import db
from datetime import datetime

class IncidentReport(db.Model):
    __tablename__ = "incident_reports"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    issue_type = db.Column(db.String(100))
    description = db.Column(db.Text)

    image_url = db.Column(db.String(255))

    village = db.Column(db.String(100))
    district = db.Column(db.String(100))
    state = db.Column(db.String(100))

    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)

    status = db.Column(
        db.String(20),
        default='Pending'
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "issue_type": self.issue_type,
            "description": self.description,
            "village": self.village,
            "district": self.district,
            "status": self.status,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
from app import db
from datetime import datetime

class WaterSource(db.Model):
    __tablename__ = 'water_sources'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    name = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    village = db.Column(db.String(100), nullable=False, index=True)
    district = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    
    # Coordinates
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Source Type
    source_type = db.Column(db.String(50), nullable=False)  # 'tap', 'borewell', 'river', 'tank', 'well', 'pond'
    
    # Status
    status = db.Column(db.String(20), default='safe')  # 'safe', 'contaminated', 'inspection', 'unknown'
    
    # Quality Metrics
    ph_level = db.Column(db.Float, nullable=True)
    turbidity = db.Column(db.String(20), nullable=True)  # 'Low', 'Moderate', 'High'
    bacterial_count = db.Column(db.String(50), nullable=True)  # 'Safe', 'Unsafe', 'Testing'
    
    # Operational
    capacity = db.Column(db.String(100), nullable=True)  # e.g., "5000 L"
    availability = db.Column(db.String(100), nullable=True)  # e.g., "09:00 - 18:00"
    
    # Timestamps
    last_tested = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'source_type': self.source_type,
            'status': self.status,
            'ph_level': self.ph_level,
            'turbidity': self.turbidity,
            'bacterial_count': self.bacterial_count,
            'capacity': self.capacity,
            'availability': self.availability,
            'last_tested': self.last_tested.isoformat() if self.last_tested else None,
        }

    def __repr__(self):
        return f'<WaterSource {self.name} - {self.status}>'

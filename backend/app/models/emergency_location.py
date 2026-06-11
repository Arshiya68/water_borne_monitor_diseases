from app import db
from datetime import datetime

class EmergencyLocation(db.Model):
    __tablename__ = 'emergency_locations'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    name = db.Column(db.String(255), nullable=False)
    location_type = db.Column(db.String(50), nullable=False)  # 'hospital', 'water_distribution', 'health_clinic'
    
    address = db.Column(db.String(500), nullable=False)
    village = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=False)
    
    # Coordinates
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    # Contact
    phone_number = db.Column(db.String(20), nullable=True)
    phone_number_2 = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    
    # Hospital Specific
    services = db.Column(db.Text, nullable=True)  # JSON or comma-separated
    beds_available = db.Column(db.Integer, nullable=True)
    is_24_7 = db.Column(db.Boolean, default=True)
    
    # Water Distribution Specific
    capacity = db.Column(db.String(100), nullable=True)  # e.g., "5000 L"
    operating_hours = db.Column(db.String(100), nullable=True)  # e.g., "09:00 - 18:00"
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location_type': self.location_type,
            'address': self.address,
            'district': self.district,
            'phone_number': self.phone_number,
            'phone_number_2': self.phone_number_2,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'services': self.services,
            'beds_available': self.beds_available,
            'is_24_7': self.is_24_7,
            'capacity': self.capacity,
            'operating_hours': self.operating_hours,
        }

    def __repr__(self):
        return f'<EmergencyLocation {self.name} - {self.location_type}>'

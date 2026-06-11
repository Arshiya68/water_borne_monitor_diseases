from app import db
from datetime import datetime

class WaterQuality(db.Model):
    __tablename__ = 'water_quality'

    id                      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    village                 = db.Column(db.String(100), nullable=False, index=True)
    district                = db.Column(db.String(100), nullable=False)
    state                   = db.Column(db.String(100), nullable=False)
    latitude                = db.Column(db.Float, nullable=True)
    longitude               = db.Column(db.Float, nullable=True)
    
    # Water Quality Parameters
    ph_level                = db.Column(db.Float, nullable=True)
    turbidity               = db.Column(db.Float, nullable=True)
    dissolved_oxygen        = db.Column(db.Float, nullable=True)
    chlorophyll_a           = db.Column(db.Float, nullable=True)
    nitrates                = db.Column(db.Float, nullable=True)
    sulphates               = db.Column(db.Float, nullable=True)
    total_suspended_solids  = db.Column(db.Float, nullable=True)
    electrical_conductivity = db.Column(db.Float, nullable=True)
    
    # Calculated Metrics
    water_quality_index     = db.Column(db.Float, default=50, index=True)
    contamination_risk      = db.Column(db.String(20), default='Low')
    disease_risk_correlation = db.Column(db.Float, default=0.0)
    
    # Source & Timing
    data_source             = db.Column(db.String(50), default='satellite')
    recorded_year           = db.Column(db.Integer, nullable=False, index=True)
    recorded_month          = db.Column(db.Integer, nullable=False)
    
    # Timestamps
    created_at              = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at              = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def calculate_quality_index(self):
        """Calculate water quality index (0-100, higher is better)"""
        score = 100
        
        if self.ph_level:
            if self.ph_level < 6.5 or self.ph_level > 8.5:
                score -= 20
        if self.turbidity and self.turbidity > 5:
            score -= 25
        if self.dissolved_oxygen and self.dissolved_oxygen < 5:
            score -= 20
        if self.nitrates and self.nitrates > 10:
            score -= 15
        if self.total_suspended_solids and self.total_suspended_solids > 25:
            score -= 20
            
        self.water_quality_index = max(0, min(100, score))
        
        if score > 70:
            self.contamination_risk = 'Low'
        elif score > 40:
            self.contamination_risk = 'Medium'
        else:
            self.contamination_risk = 'High'
        
        return self.water_quality_index

    def to_dict(self):
        return {
            'id': self.id,
            'village': self.village,
            'district': self.district,
            'water_quality_index': self.water_quality_index,
            'contamination_risk': self.contamination_risk,
            'recorded_year': self.recorded_year,
            'recorded_month': self.recorded_month,
        }

    def __repr__(self):
        return f'<WaterQuality {self.village} - {self.recorded_year}/{self.recorded_month}>'
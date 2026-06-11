from app import db

class District(db.Model):
    __tablename__ = 'districts'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(100), unique=True, nullable=False, index=True)
    latitude    = db.Column(db.Float, nullable=False)
    longitude   = db.Column(db.Float, nullable=False)
    population  = db.Column(db.Integer, nullable=True)
    state       = db.Column(db.String(100), default='Telangana')
    created_at  = db.Column(db.DateTime, default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'state': self.state,
        }

    def __repr__(self):
        return f'<District {self.name}>'


class Tehsil(db.Model):
    __tablename__ = 'tehsils'

    id              = db.Column(db.Integer, primary_key=True)
    name            = db.Column(db.String(100), nullable=False, index=True)
    district_id     = db.Column(db.Integer, db.ForeignKey('districts.id'), nullable=False, index=True)
    latitude        = db.Column(db.Float, nullable=False)
    longitude       = db.Column(db.Float, nullable=False)
    created_at      = db.Column(db.DateTime, default=db.func.now())

    district = db.relationship('District', backref='tehsils')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'district_id': self.district_id,
            'district_name': self.district.name if self.district else None,
            'latitude': self.latitude,
            'longitude': self.longitude,
        }

    def __repr__(self):
        return f'<Tehsil {self.name}>'
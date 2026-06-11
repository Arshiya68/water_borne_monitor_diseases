from app import db
from datetime import datetime
import bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id               = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name             = db.Column(db.String(100), nullable=False)
    email            = db.Column(db.String(150), unique=True, nullable=False, index=True)
    phone            = db.Column(db.String(15), unique=True, nullable=False, index=True)
    password_hash    = db.Column(db.String(255), nullable=False)
    
    role             = db.Column(db.String(20), nullable=False, default='villager', index=True)
    
    village          = db.Column(db.String(100), nullable=False)
    district         = db.Column(db.String(100), nullable=False, index=True)
    state            = db.Column(db.String(100), default='Telangana')
    latitude         = db.Column(db.Float, default=17.3850)
    longitude        = db.Column(db.Float, default=78.4867)
    
    prefer_sms       = db.Column(db.Boolean, default=True)
    prefer_email     = db.Column(db.Boolean, default=True)
    
    age              = db.Column(db.Integer, nullable=True)
    gender           = db.Column(db.String(20), nullable=True)
    profile_image    = db.Column(db.String(255), nullable=True)
    
    is_active        = db.Column(db.Boolean, default=True, index=True)
    last_login       = db.Column(db.DateTime, nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at       = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'age': self.age,
            'gender': self.gender,
            'prefer_sms': self.prefer_sms,
            'prefer_email': self.prefer_email,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
from app import db
from datetime import datetime

class CommunityEngagement(db.Model):
    __tablename__ = 'community_engagement'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    
    district = db.Column(db.String(100), nullable=False, index=True)
    village = db.Column(db.String(100), nullable=True)
    
    # Statistics
    total_population = db.Column(db.Integer, default=0)
    total_reports_submitted = db.Column(db.Integer, default=0)
    verified_reports = db.Column(db.Integer, default=0)
    active_volunteers = db.Column(db.Integer, default=0)
    
    # Engagement Score
    engagement_score = db.Column(db.Integer, default=0)  # 0-100
    participation_rate = db.Column(db.Float, default=0.0)  # percentage
    
    # Badges/Achievements
    has_100_percent_alert = db.Column(db.Boolean, default=False)
    is_top_ward = db.Column(db.Boolean, default=False)
    has_high_trust = db.Column(db.Boolean, default=False)
    is_team_player = db.Column(db.Boolean, default=False)
    
    # Metrics
    verification_rate = db.Column(db.Float, default=0.0)  # percentage
    response_time_hours = db.Column(db.Float, default=0.0)
    last_30_days_reports = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def calculate_engagement_score(self):
        """Calculate engagement score based on various metrics"""
        score = 0
        
        # Base score from participation
        if self.total_population > 0:
            participation = (self.active_volunteers / self.total_population) * 100
            score += min(30, participation * 0.3)
        
        # Score from reports
        if self.total_reports_submitted > 0:
            score += min(25, self.total_reports_submitted / 10)
            
        # Verification rate
        if self.verified_reports > 0 and self.total_reports_submitted > 0:
            self.verification_rate = (self.verified_reports / self.total_reports_submitted) * 100
            score += (self.verification_rate / 4)  # max 25 points
        
        # Recent activity
        score += min(20, self.last_30_days_reports / 5)
        
        self.engagement_score = min(100, int(score))
        if self.total_population > 0:
            self.participation_rate = (self.active_volunteers / self.total_population) * 100
        
        return self.engagement_score

    def to_dict(self):
        return {
            'district': self.district,
            'village': self.village,
            'total_reports': self.total_reports_submitted,
            'verified_reports': self.verified_reports,
            'active_volunteers': self.active_volunteers,
            'engagement_score': self.engagement_score,
            'participation_rate': self.participation_rate,
            'verification_rate': self.verification_rate,
            'badges': {
                'has_100_percent_alert': self.has_100_percent_alert,
                'is_top_ward': self.is_top_ward,
                'has_high_trust': self.has_high_trust,
                'is_team_player': self.is_team_player,
            }
        }

    def __repr__(self):
        return f'<CommunityEngagement {self.district} - {self.engagement_score}%>'

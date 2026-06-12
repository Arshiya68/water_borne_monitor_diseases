from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import config_map
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)

    env = os.environ.get('FLASK_ENV', 'development')
    app.config.from_object(config_map[env])

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": "*"
            }
        }
    )

    # ==========================
    # Import Models
    # ==========================

    from .models.user import User
    from .models.symptom_report import SymptomReport
    from .models.water_quality import WaterQuality
    from .models.location import District, Tehsil
    from .models.notification import Notification
    from .models.community_engagement import CommunityEngagement

    # Existing Models
    from .models.alert import Alert
    from .models.water_source import WaterSource
    from .models.emergency_location import EmergencyLocation

    # New Models
    from .models.incident_report import IncidentReport
    from .models.household_visit import HouseholdVisit
    from .models.alert_investigation import AlertInvestigation

    # ==========================
    # Import Blueprints
    # ==========================

    from .routes.auth import auth_bp
    from .routes.reports import reports_bp
    from .routes.analytics import analytics_bp
    from .routes.alerts import alerts_bp
    from .routes.admin import admin_bp
    from .routes.profile import profile_bp
    from .routes.locations import locations_bp
    from .routes.predictions import predictions_bp
    from .routes.risk_prediction import risk_prediction_bp
    from .routes.water_sources import water_sources_bp
    from .routes.emergency import emergency_bp
    from .routes.community import community_bp
    from .routes.sms import sms_bp

    from .routes.water_quality import water_quality_bp

    # New Routes
    from .routes.incidents import incidents_bp
    from .routes.household_visits import household_visits_bp
    from .routes.alert_investigations import alert_investigations_bp

    # ==========================
    # Register Blueprints
    # ==========================

    app.register_blueprint(
        auth_bp,
        url_prefix='/api/auth'
    )

    app.register_blueprint(
        reports_bp,
        url_prefix='/api/reports'
    )

    app.register_blueprint(
        analytics_bp,
        url_prefix='/api/analytics'
    )

    app.register_blueprint(
        alerts_bp,
        url_prefix='/api/alerts'
    )

    app.register_blueprint(
        admin_bp,
        url_prefix='/api/admin'
    )

    app.register_blueprint(
        profile_bp,
        url_prefix='/api/auth/profile'
    )

    app.register_blueprint(
        locations_bp,
        url_prefix='/api/locations'
    )

    app.register_blueprint(
        predictions_bp,
        url_prefix='/api/predictions'
    )

    app.register_blueprint(
        risk_prediction_bp,
        url_prefix='/api/risk'
    )

    app.register_blueprint(
        water_sources_bp,
        url_prefix='/api'
    )

    app.register_blueprint(
        emergency_bp,
        url_prefix='/api'
    )

    app.register_blueprint(
        community_bp,
        url_prefix='/api'
    )

    app.register_blueprint(
        sms_bp,
        url_prefix='/api'
    )

    app.register_blueprint(
        water_quality_bp,
        url_prefix='/api/water-quality'
    )

    # NEW INCIDENT REPORT ROUTE
    app.register_blueprint(
        incidents_bp,
        url_prefix='/api'
    )

    # HOUSEHOLD VISITS & ALERT INVESTIGATIONS ROUTES
    app.register_blueprint(
        household_visits_bp,
        url_prefix='/api/household-visits'
    )

    app.register_blueprint(
        alert_investigations_bp,
        url_prefix='/api/alert-investigations'
    )

    # ==========================
    # Create Tables
    # ==========================

    with app.app_context():
        db.create_all()

    return app
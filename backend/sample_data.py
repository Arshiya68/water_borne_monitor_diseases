import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Now create app
from app import create_app, db
from app.models.user import User
from app.models.symptom_report import SymptomReport
from app.models.water_quality import WaterQuality
from datetime import datetime, timedelta

# Verify DATABASE_URL is loaded
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    print("❌ ERROR: DATABASE_URL not found in .env file!")
    print("Make sure your .env file contains: DATABASE_URL=mysql+pymysql://wb_user:StrongPass123@localhost:3306/waterborne_db")
    sys.exit(1)

print(f"✅ Connected to: {database_url.split('@')[1] if '@' in database_url else database_url}")

app = create_app()

with app.app_context():
    try:
        # Clear existing data in correct FK order
        # Recreate database tables to update schemas
        print("\n[INFO] Dropping and recreating all database tables...")
        from sqlalchemy import text
        
        # Temporarily disable foreign key checks for MySQL to clear tables cleanly
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.session.commit()
        
        db.drop_all()
        db.create_all()
        
        # Re-enable foreign key checks
        db.session.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.session.commit()
        print("[OK] Recreated schemas successfully")


        # Create sample users
        print("\n👥 Creating sample users...")
        users = [
            User(
                name='Ravi Kumar',
                email='villager@test.com',
                phone='9876543210',
                role='villager',
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                age=35,
                gender='male',
                prefer_sms=True,
                prefer_email=True
            ),
            User(
                name='Priya Sharma',
                email='asha@test.com',
                phone='9876543211',
                role='asha_worker',
                village='Warangal',
                district='Warangal',
                state='Telangana',
                age=32,
                gender='female',
                prefer_sms=True,
                prefer_email=True
            ),
            User(
                name='Dr. Singh',
                email='admin1@example.com',
                phone='9876543212',
                role='admin',
                village='Hyderabad',
                district='Rangareddy',
                state='Telangana',
                age=45,
                gender='male',
                prefer_sms=True,
                prefer_email=True
            ),
            User(
                name='Dr. Rao',
                email='official1@example.com',
                phone='9876543213',
                role='official',
                village='Hyderabad',
                district='Hyderabad',
                state='Telangana',
                age=42,
                gender='female',
                prefer_sms=True,
                prefer_email=True
            ),
        ]

        for user in users:
            user.set_password('test123')
            db.session.add(user)

        # IMPORTANT: Commit users first so they get IDs
        db.session.commit()
        print(f"✅ Users created successfully ({len(users)} users)")
        for user in users:
            print(f"   ✓ {user.name} (ID: {user.id}, {user.email})")

        # Create sample water quality data
        print("\n💧 Creating water quality data...")
        water_data = [
            WaterQuality(
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                latitude=17.3850,
                longitude=78.4867,
                ph_level=7.5,
                turbidity=3.2,
                dissolved_oxygen=6.8,
                nitrates=8.5,
                sulphates=12.0,
                total_suspended_solids=18.0,
                electrical_conductivity=450.0,
                recorded_year=2026,
                recorded_month=5,
                data_source='satellite'
            ),
            WaterQuality(
                village='Warangal',
                district='Warangal',
                state='Telangana',
                latitude=17.9689,
                longitude=79.5941,
                ph_level=7.8,
                turbidity=2.1,
                dissolved_oxygen=7.2,
                nitrates=5.0,
                sulphates=10.0,
                total_suspended_solids=12.0,
                electrical_conductivity=380.0,
                recorded_year=2026,
                recorded_month=5,
                data_source='satellite'
            ),
        ]

        for wq in water_data:
            wq.calculate_quality_index()
            db.session.add(wq)

        db.session.commit()
        print(f"✅ Water quality data created successfully ({len(water_data)} records)")
        for wq in water_data:
            print(f"   ✓ {wq.village} (Quality Index: {wq.water_quality_index:.1f}, Risk: {wq.contamination_risk})")

        # Create sample water sources
        print("\n💧 Creating sample water sources...")
        from app.models.water_source import WaterSource
        sources = [
            WaterSource(
                name='Main Hand Pump A',
                location='Ward 1 - Main Street',
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                latitude=17.3850,
                longitude=78.4867,
                source_type='tap',
                status='safe',
                ph_level=7.2,
                turbidity='Low',
                bacterial_count='Safe',
                capacity='5000 L',
                availability='24/7'
            ),
            WaterSource(
                name='Borewell B2',
                location='Ward 2 - School Area',
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                latitude=17.3890,
                longitude=78.4890,
                source_type='borewell',
                status='contaminated',
                ph_level=6.5,
                turbidity='High',
                bacterial_count='Unsafe',
                capacity='10000 L',
                availability='08:00 - 20:00'
            ),
            WaterSource(
                name='Warangal Village Tank',
                location='Central Supply Plaza',
                village='Warangal',
                district='Warangal',
                state='Telangana',
                latitude=17.9689,
                longitude=79.5941,
                source_type='tank',
                status='inspection',
                ph_level=7.0,
                turbidity='Moderate',
                bacterial_count='Testing',
                capacity='25000 L',
                availability='06:00 - 18:00'
            ),
            WaterSource(
                name='Warangal Well 1',
                location='Ward 3 - Market Area',
                village='Warangal',
                district='Warangal',
                state='Telangana',
                latitude=17.9700,
                longitude=79.6000,
                source_type='well',
                status='safe',
                ph_level=7.4,
                turbidity='Low',
                bacterial_count='Safe',
                capacity='3000 L',
                availability='24/7'
            ),
        ]
        for src in sources:
            db.session.add(src)
        db.session.commit()
        print(f"✅ Water sources created successfully ({len(sources)} sources)")

        # Create sample symptom reports
        print("\n📋 Creating symptom reports...")
        reports = [
            SymptomReport(
                user_id=users[0].id,  # Use actual user ID from database
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                latitude=17.3850,
                longitude=78.4867,
                diarrhea=1,
                fever=1,
                household_affected=2,
                water_source=2,  # River
                predicted_risk='Medium',
                risk_confidence=0.65,
                water_quality_score=55
            ),
            SymptomReport(
                user_id=users[0].id,  # Use actual user ID from database
                village='Nalgonda',
                district='Nalgonda',
                state='Telangana',
                latitude=17.3850,
                longitude=78.4867,
                diarrhea=1,
                vomiting=1,
                fever=1,
                household_affected=3,
                water_source=2,  # River
                predicted_risk='High',
                risk_confidence=0.82,
                water_quality_score=35
            ),
            SymptomReport(
                user_id=users[1].id,  # Use actual user ID from database
                village='Warangal',
                district='Warangal',
                state='Telangana',
                latitude=17.9689,
                longitude=79.5941,
                diarrhea=1,
                abdominal_pain=1,
                household_affected=1,
                water_source=0,  # Tap
                predicted_risk='Low',
                risk_confidence=0.35,
                water_quality_score=75
            ),
        ]

        for report in reports:
            db.session.add(report)

        # IMPORTANT: Commit reports after adding
        db.session.commit()
        print(f"✅ Symptom reports created successfully ({len(reports)} reports)")
        for report in reports:
            print(f"   ✓ {report.village} - Risk: {report.predicted_risk} (User ID: {report.user_id})")

        # Print summary
        print("\n" + "="*70)
        print("✅✅✅ SAMPLE DATA INSERTED SUCCESSFULLY! ✅✅✅".center(70))
        print("="*70)
        print(f"👥 Users created: {len(users)}")
        print(f"💧 Water quality records: {len(water_data)}")
        print(f"📋 Symptom reports: {len(reports)}")
        print("="*70)
        print("\n📊 DATABASE CONTENTS:")
        print("-" * 70)
        print("✓ Users Table: 3 entries (villager, asha_worker, official)")
        print("✓ Water Quality Table: 2 entries (Nalgonda, Warangal)")
        print("✓ Symptom Reports Table: 3 entries (Mixed risk levels)")
        print("-" * 70)
        
        print("\n🔍 VIEW IN MYSQL WORKBENCH:")
        print("   1. Open MySQL Workbench")
        print("   2. Double-click 'WaterGuard DB' connection")
        print("   3. Expand SCHEMAS > waterborne_db > Tables")
        print("   4. Right-click 'users' > 'Select Rows - Limit 1000'")
        print("   5. You'll see all sample data with real data!")
        
        print("\n🔐 TEST LOGIN CREDENTIALS:")
        print("-" * 70)
        print("👨‍🌾 Villager:")
        print("   Email: villager@test.com")
        print("   Password: test123")
        print("   Role: Can submit symptom reports")
        print()
        print("👩‍⚕️  ASHA Worker:")
        print("   Email: asha@test.com")
        print("   Password: test123")
        print("   Role: Can verify reports and diagnose")
        print()
        print("🏥 Health Official:")
        print("   Email: admin1@example.com")
        print("   Password: test123")
        print("   Role: Full access, can send alerts")
        print("-" * 70)
        
        print("\n🚀 NEXT STEPS:")
        print("   1. Run: python run.py (to start backend)")
        print("   2. In another terminal: cd frontend && npm run dev")
        print("   3. Visit: http://localhost:5173")
        print("   4. Login with any of the credentials above")
        print("   5. See sample data and test features!")
        print("\n✨ Project is ready to use!")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        sys.exit(1)
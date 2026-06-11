import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Database configuration log
db_url = os.environ.get('DATABASE_URL')
if not db_url:
    print("⚠️ WARNING: DATABASE_URL not found in .env file! Falling back to local SQLite: waterborne.db")
    db_url = "sqlite:///waterborne.db"

# Now create app
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("🚀 Starting WaterGuard Backend Server...")
    print(f"📊 Database: {db_url.split('@')[1] if '@' in db_url else db_url}")
    print("🌐 Server: http://0.0.0.0:5000")
    print("📱 Frontend: http://localhost:5173")
    print("\n✅ Backend is running! Press Ctrl+C to stop.")
    app.run(debug=True, host='0.0.0.0', port=5000)
import os
from dotenv import load_dotenv
load_dotenv()
print('DATABASE_URL=', os.environ.get('DATABASE_URL'))
from app import create_app, db
app = create_app()
print('SQLALCHEMY_DATABASE_URI:', app.config['SQLALCHEMY_DATABASE_URI'])
with app.app_context():
    try:
        engine = db.engine
        print('Engine URL:', engine.url)
        conn = engine.connect()
        print('Connected to DB successfully')
        res = conn.execute('SELECT 1')
        print('SELECT 1 result:', res.fetchone())
        conn.close()
    except Exception as e:
        print('DB connection error:', repr(e))

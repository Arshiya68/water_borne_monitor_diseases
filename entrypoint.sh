#!/bin/sh

echo "==========================================="
echo "🚀 Starting WaterGuard Container Services..."
echo "==========================================="

# Start Nginx in the background
echo "Starting Nginx web server..."
nginx

# Run database setup & seeding
echo "Seeding default database records..."
cd /app/backend
python sample_data.py

# Start Gunicorn server in the foreground to keep the container running
echo "Starting Gunicorn Flask backend server..."
exec gunicorn --bind 127.0.0.1:5000 run:app

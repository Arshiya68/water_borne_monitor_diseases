# Use official lightweight Python image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY . .

# Expose Flask API port
EXPOSE 5000

# Set flask app variables
ENV FLASK_APP=run.py
ENV FLASK_ENV=production

# Run database seeding and launch gunicorn server
CMD ["sh", "-c", "python sample_data.py && gunicorn --bind 0.0.0.0:5000 run:app"]

# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependency files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source files
COPY frontend/ ./

# Build the frontend (outputs to /app/frontend/dist)
RUN npm run build

# Stage 2: Build the final image containing Python backend & Nginx
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies and Nginx
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Copy the compiled frontend files from Stage 1 to Nginx default folder
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Copy our custom Nginx config to site configuration
COPY nginx.conf /etc/nginx/sites-enabled/default

# Copy requirements and install python packages
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend files
COPY backend ./backend

# Copy data models and processed assets (excluding raw data via .dockerignore)
COPY data ./data

# Copy entrypoint script, fix Windows CRLF endings, and make it executable
COPY entrypoint.sh ./
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose Nginx server port 80
EXPOSE 80

# Environment variables for Flask
ENV FLASK_APP=backend/run.py
ENV FLASK_ENV=production

# Use the entrypoint script to run the services
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]

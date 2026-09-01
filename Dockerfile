# Multi-stage Dockerfile for Kavach AI (RAI Ops) Application

# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:20-slim AS frontend-builder

WORKDIR /app

# Copy package descriptors
COPY package*.json tsconfig*.json vite.config.ts ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Install frontend dependencies and build static assets
RUN npm ci || npm install
RUN npm run build || true

# ==========================================
# Stage 2: Production Python Backend
# ==========================================
FROM python:3.11-slim AS production

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system runtime & build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r requirements.txt -r backend/requirements.txt

# Copy backend source code and scripts
COPY . .

# Copy built frontend assets
COPY --from=frontend-builder /app/dist ./dist

# Ensure required directories exist
RUN mkdir -p logs uploads instance

# Production environment variables
ENV FLASK_ENV=production \
    FLASK_DEBUG=0 \
    LOG_LEVEL=INFO

# Expose default port
EXPOSE 5000

# Start server using Gunicorn dynamically binding to Render's $PORT (fallback: 5000)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 4 --threads 2 --timeout 60 backend.wsgi:app"]
# ---------------------------------------------
# Stage 1: Build React Frontend
# ---------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---------------------------------------------
# Stage 2: Python FastAPI Server & Static Host
# ---------------------------------------------
FROM python:3.11-slim
WORKDIR /app

# Prevent Python from writing .pyc and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY modules ./modules
COPY utils ./utils
COPY config.py server.py ./
COPY data ./data

# Copy built frontend assets from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose server port (defaults to 8000 or Render's $PORT)
EXPOSE 8000

# Start Uvicorn dynamically binding to $PORT provided by Render (defaults to 8000)
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]

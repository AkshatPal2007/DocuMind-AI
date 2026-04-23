# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies (build tools, libomp for some ML libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libomp-dev \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend codebase
COPY backend/ ./backend/
COPY ml/ ./ml/


# We don't copy data/ here because it will be mounted as a volume
# to ensure ChromaDB and uploads persist across container restarts.

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8000

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

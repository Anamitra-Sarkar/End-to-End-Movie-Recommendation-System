FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy NLTK setup script and run it
COPY nltk_setup.py .
RUN python nltk_setup.py

# Copy application code
COPY . .

# Expose port
EXPOSE 10000

# Use gunicorn for production on port 10000
# --workers 1: Single worker to stay within 512MB RAM limit on free tier
# --threads 1: Single thread to minimize memory usage
# --timeout 0: No timeout (infinite) to handle long-running requests
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "1", "--threads", "1", "--timeout", "0", "app:app"]

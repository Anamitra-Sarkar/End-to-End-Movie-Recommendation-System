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
# --preload: Load application code before worker processes are forked (shares memory for similarity matrix)
# --timeout 300: Allow up to 5 minutes for requests (initial cold start can be slow)
# --workers 2: Use 2 worker processes for handling requests
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--timeout", "300", "--preload", "app:app"]

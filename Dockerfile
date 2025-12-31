# Use Python 3.9 Slim
FROM python:3.9-slim

# Working Directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy NLTK setup script and run it
COPY nltk_setup.py .
RUN python nltk_setup.py

# Copy App
COPY . .

# Hugging Face Spaces Listen on 7860
EXPOSE 7860

# Start Command (Workers=1 for safety, Threads=8 for concurrency)
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "8", "--timeout", "0", "app:app"]

FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data (if used)
RUN python -m nltk.downloader punkt stopwords

COPY . .

# Hugging Face Standard Port
EXPOSE 7860

# START COMMAND (Using python -m to avoid PATH errors)
CMD ["python", "-m", "gunicorn", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "8", "--timeout", "0", "app:app"]

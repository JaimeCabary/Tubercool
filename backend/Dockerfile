FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency resolution
RUN pip install uv

# Copy the pyproject.toml
COPY pyproject.toml .

# Install dependencies using uv directly into the system python
RUN uv pip install --system -e .

# Need pydantic[email] which isn't always captured properly without extras
RUN uv pip install --system "pydantic[email]"

# Copy source code
COPY . .

# Expose port (Railway dynamically provides PORT env var, but defaults to 8000 here)
EXPOSE 8000

# Command to run the application (using Railway's $PORT if provided, else 8000)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

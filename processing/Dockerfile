# Processing Dockerfile - Python Flask Application
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies required for OpenCV and other packages
RUN apt-get update && apt-get install -y \
  gcc \
  g++ \
  cmake \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  libgomp1 \
  libgtk-3-0 \
  libavcodec-dev \
  libavformat-dev \
  libswscale-dev \
  libv4l-dev \
  libxvidcore-dev \
  libx264-dev \
  libjpeg-dev \
  libpng-dev \
  libtiff-dev \
  libatlas-base-dev \
  gfortran \
  libhdf5-dev \
  libhdf5-serial-dev \
  python3-pyqt5 \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads output

# Expose the port the app runs on
EXPOSE 5001

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Command to run the application
CMD ["python", "server.py"]

# Use an official NVIDIA CUDA base image with Python 3.10
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# Set non-interactive to avoid timezone prompts during apt-get
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install Python and essential tools
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    python3.10-venv \
    git \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set python3 as default
RUN ln -s /usr/bin/python3.10 /usr/bin/python

# Create working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cu121
RUN pip install --no-cache-dir transformers peft accelerate bitsandbytes huggingface_hub

# Copy application code
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Run the FastAPI server via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

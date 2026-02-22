FROM python:3.10-slim

WORKDIR /app

# Install lightweight CPU PyTorch to fit in Free Tier container limits
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir transformers peft accelerate bitsandbytes huggingface_hub
RUN pip install --no-cache-dir fastapi uvicorn python-multipart Pillow

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

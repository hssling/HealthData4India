import os
import shutil
from huggingface_hub import create_repo, upload_folder, whoami

def deploy_backend_space():
    user = whoami()["name"]
    repo_id = f"{user}/Omni-XRay-Backend"
    
    print(f"Creating Hugging Face Space: {repo_id}...")
    try:
        # Create a new Docker space
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            space_hardware="cpu-basic", 
            exist_ok=True
        )
        print(f"Space created or already exists!")
        
        # Prepare specialized lightweight deployment folder
        os.makedirs("hf_space_backend", exist_ok=True)
        shutil.copy("xray-analyzer/backend/main.py", "hf_space_backend/main.py")
        
        # We write a custom CPU-only Dockerfile for the free tier so it doesn't OOM or take hours building CUDA.
        dockerfile_content = """FROM python:3.10-slim

WORKDIR /app

# Install lightweight CPU PyTorch to fit in Free Tier container limits
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir transformers peft accelerate bitsandbytes huggingface_hub
RUN pip install --no-cache-dir fastapi uvicorn python-multipart Pillow

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
"""
        with open("hf_space_backend/Dockerfile", "w") as f:
            f.write(dockerfile_content)

        # Write YAML Frontmatter
        readme_content = """---
title: Omni-XRay Backend API
emoji: ⚡
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 8000
---
"""
        with open("hf_space_backend/README.md", "w") as f:
            f.write(readme_content)

        print(f"Uploading FastAPI backend to the Space...")
        upload_folder(
            folder_path="./hf_space_backend",
            repo_id=repo_id,
            repo_type="space"
        )
        print("✅ SUCCESS! FastAPI Backend deployed automatically.")
        print(f"Your API will live at: https://huggingface.co/spaces/{repo_id}")
        print(f"API Endpoint Route: https://{user}-omni-xray-backend.hf.space/api/diagnose")
        
    except Exception as e:
        print(f"Deployment Failed: {e}")

if __name__ == "__main__":
    deploy_backend_space()

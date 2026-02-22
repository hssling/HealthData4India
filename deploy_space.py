import os
from huggingface_hub import create_repo, upload_folder, whoami

def deploy_space():
    user = whoami()["name"]
    repo_id = f"{user}/Omni-XRay-Trainer"
    
    print(f"Creating Hugging Face Space: {repo_id}...")
    try:
        # Create a new space
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="gradio",
            space_hardware="cpu-basic", # Default free hardware to guarantee creation, user can change if community T4 is granted
            exist_ok=True
        )
        print(f"Space created or already exists!")
        
        print(f"Uploading app code from 'hf_space_training/' to the Space...")
        # Upload the folder containing the Gradio App and training scripts
        upload_folder(
            folder_path="./hf_space_training",
            repo_id=repo_id,
            repo_type="space"
        )
        print("✅ SUCCESS! Application deployed automatically.")
        print(f"You can view your running Hugging Face Space application at: https://huggingface.co/spaces/{repo_id}")
        
    except Exception as e:
        print(f"Deployment Failed: {e}")

if __name__ == "__main__":
    deploy_space()

import gradio as gr
import subprocess
import threading
import sys
import os

def run_training_script(hf_token):
    # Set the token as an env variable for the subprocess
    env = os.environ.copy()
    env["HF_TOKEN"] = hf_token

    # We run the actual training script in a separate process so we can stream logs
    process = subprocess.Popen(
        [sys.executable, "train.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        env=env,
        bufsize=1
    )
    
    for line in iter(process.stdout.readline, ''):
        yield line
    process.stdout.close()
    process.wait()
    yield "Training execution finished."

def start_training():
    # Attempt to inherently pull the token from the HF Space securely injected secret.
    hf_token = os.environ.get("HF_TOKEN", "")
    
    if not hf_token:
        yield "Automatic environment injection failed. Please restart space."
        return
        
    yield "Secure Token Detected. Starting the LoRA Fine-Tuning Pipeline automatically on boot...\n"
    for log_line in run_training_script(hf_token):
        yield log_line

with gr.Blocks(title="MedGemma XRay Fine-Tuner") as demo:
    gr.Markdown("# 🦴 Omni-XRay AI: MedGemma Free GPU Fine-Tuner")
    gr.Markdown("This Hugging Face Space automatically spins up a process to fine-tune `google/medgemma-1.5-4b-it` using QLoRA and pushes the `.safetensors` model weights to your HF repository account.")
    
    log_output = gr.Textbox(label="Autonomous Training Logs", lines=25, max_lines=40)
    
    # Trigger training the very second the UI loads, no human clicking required!
    demo.load(fn=start_training, inputs=[], outputs=[log_output])

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)

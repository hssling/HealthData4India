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

def start_training(hf_token):
    if not hf_token:
        yield "Please provide a valid Hugging Face Token (Write Access)."
        return
    yield "Starting the LoRA Fine-Tuning Pipeline...\n"
    for log_line in run_training_script(hf_token):
        yield log_line

with gr.Blocks(title="MedGemma XRay Fine-Tuner") as demo:
    gr.Markdown("# 🦴 Omni-XRay AI: MedGemma Free GPU Fine-Tuner")
    gr.Markdown("This Hugging Face Space automatically spins up a process to fine-tune `google/medgemma-1.5-4b-it` using QLoRA and pushes the `.safetensors` model weights to your HF repository account.")
    
    with gr.Row():
        token_input = gr.Textbox(label="Hugging Face Token (Requires Write Role)", placeholder="hf_xxxxxxxx...", type="password")
        start_btn = gr.Button("🚀 Start GPU Fine-Tuning", variant="primary")
        
    log_output = gr.Textbox(label="Training Logs", lines=20, max_lines=30)
    
    start_btn.click(fn=start_training, inputs=[token_input], outputs=[log_output])

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)

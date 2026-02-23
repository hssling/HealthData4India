#!/bin/bash
# AWS EC2 User-Data Script for GPU Inference Server Setup
# OS Recommened: Ubuntu Server 22.04 LTS (HVM)
# Instance Type Recommended: g5.xlarge (or any NVIDIA A10G/T4 instance)

# 1. Update and system dependencies
apt-get update -y
apt-get upgrade -y
apt-get install -y git curl wget jq

# 2. Install NVIDIA Drivers & CUDA Toolkit (if not using Deep Learning AMI)
# (Assuming Ubuntu 22.04 base. If using Deep Learning AMI, skip this step)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
dpkg -i cuda-keyring_1.0-1_all.deb
apt-get update
apt-get -y install cuda-toolkit-12-1 

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker ubuntu

# 4. Install NVIDIA Container Toolkit
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt-get update
apt-get install -y nvidia-container-toolkit
nvidia-ctk runtime configure --runtime=docker
systemctl restart docker

# 5. Clone the GitHub Repository Structure
cd /home/ubuntu
sudo -u ubuntu git clone https://github.com/hssling/HealthData4India.git
cd HealthData4India/xray-analyzer/backend

# 6. Setup HuggingFace Token (Pulling from AWS Systems Manager Parameter Store or hardcoded)
# export HF_TOKEN="your_hf_token_here"
# echo "HF_TOKEN=$HF_TOKEN" > .env

# 7. Build and Run the Inference Container
sudo -u ubuntu docker compose up -d --build

echo "Deployment via AWS EC2 User Data completed!"

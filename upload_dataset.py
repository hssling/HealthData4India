import os
import shutil
import pandas as pd
from datasets import load_dataset
from huggingface_hub import HfApi
import kaggle

# 1. Load dataset
print("Loading g-ronimo/NIH-Chest-X-ray-dataset_10k...")
ds = load_dataset("g-ronimo/NIH-Chest-X-ray-dataset_10k")

# 2. Push to HF
print("Pushing to HF...")
ds.push_to_hub("hssling/Chest-XRay-10k-Control", private=False)

# 3. Export to disk for Kaggle
print("Preparing Kaggle dataset...")
kaggle_dir = "kaggle_dataset"
os.makedirs(os.path.join(kaggle_dir, "images"), exist_ok=True)

df_data = []
max_save = 1000 # Save a smaller zip to save time & space locally for Kaggle upload

for i, record in enumerate(ds['train']):
    if i >= max_save:
        break
    img = record['image']
    label = str(record['labels'])
    img_name = f"image_{i}.png"
    img.save(os.path.join(kaggle_dir, "images", img_name))
    df_data.append({"image_id": img_name, "diagnosis": label, "is_control": "No Finding" in label})

df = pd.DataFrame(df_data)
df.to_csv(os.path.join(kaggle_dir, "metadata.csv"), index=False)

# Create dataset-metadata.json for Kaggle
meta = {
    "title": "Chest XRay 10k Control Diagnoses",
    "id": "hssling/chest-xray-10k-diagnostic-controls",
    "licenses": [{"name": "CC0-1.0"}]
}
import json
with open(os.path.join(kaggle_dir, "dataset-metadata.json"), "w") as f:
    json.dump(meta, f)

# 4. Upload to Kaggle
print("Uploading to Kaggle...")
api = kaggle.KaggleApi()
api.authenticate()
api.dataset_create_new(folder=kaggle_dir, dir_mode='zip', quiet=False)

print("Dataset tasks complete!")

from datasets import load_dataset

try:
    ds = load_dataset("alkzar90/NIH-Chest-X-ray-dataset", split="train[:1000]", trust_remote_code=True)
    print("Dataset found, features:", ds.features)
except Exception as e:
    print("Failed to load:", e)
    
try:
    ds2 = load_dataset("Bingsu/Chest_X-Ray_Images_Pneumonia", split="train[:100]")
    print("Dataset Pneumonia found, features:", ds2.features)
except Exception as e:
    print("Failed to load Pneumonia:", e)

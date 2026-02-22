from datasets import load_dataset_builder, load_dataset

try:
    ds = load_dataset("nielsr/NIH-Chest-X-ray-dataset", streaming=True)
    print("Found nielsr!")
except Exception as e:
    pass

try:
    ds = load_dataset("truongson/NIH-Chest-X-ray-dataset", streaming=True)
    print("Found truongson!")
except Exception as e:
    pass

from huggingface_hub import HfApi
api = HfApi()
datasets = api.list_datasets(search="nih chest xray", limit=20)
for d in datasets:
    print(d.id)

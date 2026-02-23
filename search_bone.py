from huggingface_hub import HfApi
api = HfApi()
datasets = api.list_datasets(search="MURA", limit=10)
for d in datasets:
    print(d.id)

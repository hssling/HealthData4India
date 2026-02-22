import kaggle

api = kaggle.KaggleApi()
api.authenticate()

print("NIH Chest:")
datasets = api.dataset_list(search='NIH chest')
for d in datasets[:5]:
    size_mb = getattr(d, 'totalBytes', 0) / (1024*1024) if hasattr(d, 'totalBytes') else 0
    print(d.ref, d.title, f"{size_mb:.2f} MB")

print("\nPneumonia:")
datasets2 = api.dataset_list(search='chest xray')
for d in datasets2[:5]:
    size_mb = getattr(d, 'totalBytes', 0) / (1024*1024) if hasattr(d, 'totalBytes') else 0
    print(d.ref, d.title, f"{size_mb:.2f} MB")

from datasets import load_dataset
ds = load_dataset("g-ronimo/NIH-Chest-X-ray-dataset_10k")
print(ds)
print(ds['train'].features)
print(ds['train'][0])

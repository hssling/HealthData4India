from huggingface_hub import HfApi
api = HfApi()
models = api.list_models(search="medgemma", limit=5)
for m in models:
    print(m.id)

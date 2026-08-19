MODEL_NAME = "all-MiniLM-L6-v2"

class EmbeddingModel:
    def __init__(self):
        print(f"Loading embedding model: {MODEL_NAME}")

        # Import only when the model is actually needed
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(MODEL_NAME)

    def embed_text(self, text):
        return self.model.encode(text).tolist()

    def embed_documents(self, texts):
        return self.model.encode(texts).tolist()
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingModel:
    def __init__(self):
        print(f"Loading embedding model: {MODEL_NAME}")
        self.model = SentenceTransformer(MODEL_NAME)

    def embed_text(self, text: str):
        return self.model.encode(text).tolist()

    def embed_documents(self, texts: list[str]):
        return self.model.encode(texts).tolist()
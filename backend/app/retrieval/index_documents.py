from app.ingestion.loader import load_pdf
from app.ingestion.splitter import split_documents
from app.ingestion.embeddings import EmbeddingModel
from app.retrieval.vectorstore import VectorStore


PDF_PATH = "data/documents/sample.pdf"


def main():

    print("=" * 60)
    print("CIVICLENS DOCUMENT INDEXING")
    print("=" * 60)

    # Step 1: Load PDF
    print("\n[1] Loading PDF...")

    documents = load_pdf(PDF_PATH)

    print(f"Pages extracted: {len(documents)}")

    # Step 2: Split into chunks
    print("\n[2] Splitting documents...")

    chunks = split_documents(documents)

    print(f"Total chunks: {len(chunks)}")

    # Step 3: Create embeddings
    print("\n[3] Creating embeddings...")

    embedding_model = EmbeddingModel()

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = embedding_model.embed_documents(texts)

    print(
        f"Created {len(embeddings)} embeddings."
    )

    # Step 4: Store in ChromaDB
    print("\n[4] Storing in ChromaDB...")

    vector_store = VectorStore()

    vector_store.add_documents(
        chunks,
        embeddings
    )

    print("\n" + "=" * 60)
    print("INDEXING COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
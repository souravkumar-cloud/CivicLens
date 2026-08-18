from app.ingestion.embeddings import EmbeddingModel
from app.retrieval.vectorstore import VectorStore


def search_documents(query: str, top_k: int = 3):

    print(f"\nSearching for: {query}")

    # Load embedding model
    embedding_model = EmbeddingModel()

    # Convert question into embedding
    query_embedding = embedding_model.embed_text(query)

    # Search ChromaDB
    vector_store = VectorStore()

    results = vector_store.search(
        query_embedding=query_embedding,
        top_k=top_k
    )

    return results


def main():

    query = input("\nEnter your question: ")

    results = search_documents(query)

    print("\n" + "=" * 70)
    print("SEARCH RESULTS")
    print("=" * 70)

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for index, (document, metadata, distance) in enumerate(
        zip(documents, metadatas, distances),
        start=1
    ):

        print(f"\nResult #{index}")
        print("-" * 70)

        print("Text:")
        print(document)

        print("\nSource:")
        print(metadata["source"])

        print("Page:")
        print(metadata["page"])

        print("Distance:")
        print(distance)


if __name__ == "__main__":
    main()
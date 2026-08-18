from app.retrieval.vectorstore import VectorStore


def main():

    vector_store = VectorStore()

    collection = vector_store.collection

    print("=" * 70)
    print("CIVICLENS KNOWLEDGE BASE")
    print("=" * 70)

    print(
        f"\nTotal chunks: {collection.count()}"
    )

    results = collection.get(
        limit=10,
        include=["metadatas"]
    )

    print("\nSources:")

    for metadata in results["metadatas"]:

        print(
            f"- {metadata.get('source')}"
        )

        if "source_url" in metadata:
            print(
                f"  URL: {metadata['source_url']}"
            )


if __name__ == "__main__":
    main()
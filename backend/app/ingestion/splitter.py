from langchain_text_splitters import RecursiveCharacterTextSplitter


def split_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150
    )

    chunks = []

    for document in documents:

        text = document.get(
            "text",
            ""
        )

        if not text.strip():
            continue

        split_texts = splitter.split_text(
            text
        )

        for chunk_text in split_texts:

            chunk = {
                "text": chunk_text,

                "source": document.get(
                    "source",
                    "Unknown Source"
                ),

                "page": document.get(
                    "page",
                    1
                )
            }

            # VERY IMPORTANT:
            # Preserve URL metadata
            if document.get("source_url"):

                chunk["source_url"] = (
                    document["source_url"]
                )

            chunks.append(chunk)

    print(
        f"Total chunks created: {len(chunks)}"
    )

    return chunks
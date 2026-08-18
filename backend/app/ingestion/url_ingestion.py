from urllib.parse import urlparse

from app.ingestion.web_loader import load_url
from app.ingestion.splitter import split_documents
from app.ingestion.embeddings import EmbeddingModel
from app.retrieval.vectorstore import VectorStore


ALLOWED_DOMAINS = [
    ".gov.in",
    ".nic.in"
]


def validate_url(url: str):

    parsed = urlparse(url)

    if parsed.scheme not in [
        "http",
        "https"
    ]:

        raise ValueError(
            "Only HTTP and HTTPS URLs are allowed."
        )

    hostname = parsed.hostname

    if not hostname:

        raise ValueError(
            "Invalid URL."
        )

    hostname = hostname.lower()

    allowed = any(
        hostname.endswith(domain)
        for domain in ALLOWED_DOMAINS
    )

    if not allowed:

        raise ValueError(
            "Only official government domains "
            "such as .gov.in or .nic.in are allowed."
        )


def ingest_url(
    url: str,
    title: str = "Government Source"
):

    validate_url(url)

    print("\nFetching URL:")
    print(url)

    result = load_url(url)

    pages = result["pages"]

    if not pages:

        raise ValueError(
            "No readable text was found at this URL."
        )

    documents = []

    for page in pages:

        documents.append({
            "text": page["text"],
            "page": page["page"],
            "source": title,
            "source_url": url
        })

    print(
        f"Pages extracted: {len(documents)}"
    )

    chunks = split_documents(
        documents
    )

    print(
        f"Chunks created: {len(chunks)}"
    )

    embedding_model = EmbeddingModel()

    texts = [
        chunk["text"]
        for chunk in chunks
    ]

    embeddings = (
        embedding_model.embed_documents(
            texts
        )
    )

    vector_store = VectorStore()

    vector_store.add_documents(
        chunks,
        embeddings
    )

    return {
        "url": url,
        "title": title,
        "document_type": result[
            "document_type"
        ],
        "pages": len(documents),
        "chunks": len(chunks)
    }
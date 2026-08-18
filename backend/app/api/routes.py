from fastapi import APIRouter, HTTPException
from pydantic import BaseModel,Field

from app.rag.pipeline import CivicLensRAG


router = APIRouter(
    prefix="/api/v1",
    tags=["CivicLens"]
)


class QuestionRequest(BaseModel):
    question: str 
    source_urls: list[str] | None = None
    
class URLIngestionRequest(BaseModel):
    url: str
    title: str = "Government Source"


class Source(BaseModel):
    source: str
    page: int
    source_url: str | None = None
    distance: float


class QuestionResponse(BaseModel):
    answer: str
    sources: list[Source]


rag = None


def get_rag():
    global rag

    if rag is None:
        rag = CivicLensRAG()

    return rag


@router.get("/sources")
def get_sources():

    try:

        from app.retrieval.vectorstore import (
            VectorStore
        )

        vector_store = VectorStore()

        sources = vector_store.list_sources()

        return {
            "count": len(sources),
            "sources": sources
        }

    except Exception as error:

        print(
            f"Source listing error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to load sources."
        )
        
        
@router.delete("/sources/{source_id}")
def delete_source(source_id: str):

    try:

        from app.retrieval.vectorstore import (
            VectorStore
        )

        vector_store = VectorStore()

        sources = vector_store.list_sources()

        target = None

        for source in sources:

            if source["source_id"] == source_id:

                target = source
                break

        if not target:

            raise HTTPException(
                status_code=404,
                detail="Source not found."
            )

        deleted_chunks = (
            vector_store.delete_source(
                target["source_url"]
            )
        )

        return {
            "message": "Source deleted.",
            "source": target["source"],
            "deleted_chunks": deleted_chunks
        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            f"Source deletion error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to delete source."
        )

@router.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "CivicLens API"
    }
    
@router.post("/ingest-url")
def ingest_url_endpoint(
    request: URLIngestionRequest
):

    try:

        from app.ingestion.url_ingestion import (
            ingest_url
        )

        result = ingest_url(
            url=request.url,
            title=request.title
        )

        return {
            "message": "URL successfully ingested.",
            "data": result
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        print(
            f"URL ingestion error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to ingest URL."
        )


@router.post("/ask", response_model=QuestionResponse)
def ask_question(request: QuestionRequest):

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:

        civic_lens = get_rag()

        result = civic_lens.answer(
            question,
            source_urls=request.source_urls
        )

        sources = [
            {
                "source": source["source"],
                "source_url": source.get("source_url"),
                "page": source["page"],
                "distance": source["distance"]
            }
            for source in result["sources"]
        ]

        return {
            "answer": result["answer"],
            "sources": sources
        }

    except Exception as error:

        print(f"CivicLens error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Failed to process the question."
        )
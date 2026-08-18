from app.ingestion.embeddings import EmbeddingModel
from app.retrieval.vectorstore import VectorStore
from app.rag.llm import CivicLensLLM


class CivicLensRAG:

    def __init__(self):

        print("Initializing CivicLens RAG...")

        self.embedding_model = EmbeddingModel()
        self.vector_store = VectorStore()
        self.llm = CivicLensLLM()

    def retrieve(self, question: str, top_k: int = 3,source_urls= None):

        query_embedding = self.embedding_model.embed_text(
            question
        )

        results = self.vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            source_urls=source_urls
        )

        return results

    def build_context(self, results):

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        context_parts = []

        for index, (
            document,
            metadata,
            distance
        ) in enumerate(
            zip(
                documents,
                metadatas,
                distances
            ),
            start=1
        ):

            context_parts.append(
                f"""
SOURCE {index}

Document: {metadata["source"]}
Page: {metadata["page"]}
Retrieval Distance: {distance}

Content:
{document}
"""
            )

        return "\n".join(context_parts)

    def get_sources(self, results):

        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        unique_sources = []

        seen = set()

        for metadata, distance in zip(
            metadatas,
            distances
        ):

            key = (
                metadata["source"],
                metadata.get("source_url"),
                metadata["page"]
            )

            if key in seen:
                continue

            seen.add(key)

            unique_sources.append({
                "source": metadata["source"],
                "source_url": metadata.get(
                    "source_url"
                ),
                "page": metadata["page"],
                "distance": distance
            })

        return unique_sources

    def answer(self, question: str,source_urls=None):

        print("\nRetrieving relevant documents...")

        results = self.retrieve(question,source_urls=source_urls)

        context = self.build_context(results)

        prompt = f"""
You are CivicLens, an AI assistant that answers
questions about government documents.

You MUST follow these rules:

1. Answer ONLY from the provided context.
2. Do not use outside knowledge.
3. Do not invent facts.
4. Do not guess missing information.
5. Preserve exact numbers, dates, limits,
   eligibility requirements and conditions.
6. If the context does not contain the answer,
   clearly say that the information was not found
   in the available CivicLens documents.
7. Keep the answer clear and concise.
8. Do not mention retrieval distance.
9. Do not create fake sources.

CONTEXT:

{context}

USER QUESTION:

{question}

ANSWER:
"""

        print("Generating answer...")

        answer = self.llm.generate(prompt)

        sources = self.get_sources(results)

        return {
            "answer": answer,
            "sources": sources
        }
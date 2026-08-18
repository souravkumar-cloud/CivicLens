import hashlib
from pathlib import Path

import chromadb


# ============================================================
# VECTOR STORE CONFIGURATION
# ============================================================

VECTORSTORE_PATH = Path("vectorstore")

COLLECTION_NAME = "civiclens_documents"


# ============================================================
# VECTOR STORE
# ============================================================

class VectorStore:

    def __init__(self):

        print("Initializing ChromaDB...")

        self.client = chromadb.PersistentClient(
            path=str(VECTORSTORE_PATH)
        )

        self.collection = (
            self.client.get_or_create_collection(
                name=COLLECTION_NAME
            )
        )

        print(
            f"Collection: {COLLECTION_NAME}"
        )

        print(
            f"Existing chunks: {self.collection.count()}"
        )


    # ========================================================
    # ADD / UPDATE DOCUMENTS
    # ========================================================

    def add_documents(
        self,
        chunks,
        embeddings
    ):

        if not chunks:
            print(
                "No chunks to add."
            )
            return

        if not embeddings:
            print(
                "No embeddings to add."
            )
            return

        if len(chunks) != len(embeddings):

            raise ValueError(
                "Number of chunks and embeddings "
                "must be the same."
            )


        documents = []
        metadatas = []
        ids = []


        for index, (
            chunk,
            embedding
        ) in enumerate(
            zip(chunks, embeddings)
        ):

            # ------------------------------------------------
            # DOCUMENT TEXT
            # ------------------------------------------------

            text = chunk.get(
                "text",
                ""
            )

            if not text.strip():
                continue


            documents.append(text)


            # ------------------------------------------------
            # METADATA
            # ------------------------------------------------

            source = chunk.get(
                "source",
                "Unknown Source"
            )

            page = chunk.get(
                "page",
                1
            )

            source_url = chunk.get(
                "source_url"
            )


            metadata = {
                "source": source,
                "page": page
            }


            # Only add source_url when available
            if source_url:

                metadata["source_url"] = (
                    source_url
                )


            metadatas.append(
                metadata
            )


            # ------------------------------------------------
            # UNIQUE CHUNK ID
            # ------------------------------------------------

            id_source = (
                source_url
                if source_url
                else source
            )

            unique_string = (
                f"{id_source}-{index}"
            )

            chunk_id = hashlib.md5(
                unique_string.encode(
                    "utf-8"
                )
            ).hexdigest()


            ids.append(
                chunk_id
            )


        # ====================================================
        # STORE IN CHROMADB
        # ====================================================

        if not documents:

            print(
                "No valid documents found."
            )

            return


        self.collection.upsert(

            documents=documents,

            embeddings=embeddings[:len(documents)],

            metadatas=metadatas,

            ids=ids
        )


        print(
            f"Added/updated "
            f"{len(documents)} chunks "
            f"in ChromaDB."
        )

        print(
            f"Total chunks now: "
            f"{self.collection.count()}"
        )


    # ========================================================
    # LIST SOURCES
    # ========================================================

    def list_sources(self):

        results = self.collection.get(
            include=[
                "metadatas"
            ]
        )


        sources = {}


        metadatas = (
            results.get(
                "metadatas",
                []
            )
            or []
        )


        for metadata in metadatas:

            if not metadata:
                continue


            source_url = metadata.get(
                "source_url"
            )


            source_name = metadata.get(
                "source",
                "Unknown Source"
            )


            # ----------------------------------------------
            # If this is an old document without URL
            # use the source name as its identifier.
            # ----------------------------------------------

            if not source_url:

                source_url = source_name


            if source_url not in sources:

                sources[source_url] = {

                    "source_id":
                        hashlib.md5(
                            source_url.encode(
                                "utf-8"
                            )
                        ).hexdigest(),

                    "source":
                        source_name,

                    "source_url":
                        (
                            metadata.get(
                                "source_url"
                            )
                        ),

                    "chunks": 0
                }


            sources[source_url][
                "chunks"
            ] += 1


        return list(
            sources.values()
        )


    # ========================================================
    # DELETE SOURCE
    # ========================================================

    def delete_source(
        self,
        source_url: str
    ):

        results = self.collection.get(
            include=[
                "metadatas"
            ]
        )


        ids_to_delete = []


        ids = results.get(
            "ids",
            []
        )


        metadatas = (
            results.get(
                "metadatas",
                []
            )
            or []
        )


        for chunk_id, metadata in zip(
            ids,
            metadatas
        ):

            if not metadata:
                continue


            if metadata.get(
                "source_url"
            ) == source_url:

                ids_to_delete.append(
                    chunk_id
                )


        if ids_to_delete:

            self.collection.delete(
                ids=ids_to_delete
            )


        print(
            f"Deleted "
            f"{len(ids_to_delete)} chunks "
            f"for source: {source_url}"
        )


        return len(
            ids_to_delete
        )


    # ========================================================
    # SEARCH
    # ========================================================

    def search(
        self,
        query_embedding,
        top_k=3,
        source_urls=None
    ):

        # ----------------------------------------------------
        # Prevent asking for more results than exist
        # ----------------------------------------------------

        total_chunks = (
            self.collection.count()
        )


        if total_chunks == 0:

            print(
                "ChromaDB is empty."
            )

            return {
                "ids": [[]],
                "documents": [[]],
                "metadatas": [[]],
                "distances": [[]]
            }


        top_k = min(
            top_k,
            total_chunks
        )


        # ----------------------------------------------------
        # Build query
        # ----------------------------------------------------

        query_kwargs = {

            "query_embeddings": [
                query_embedding
            ],

            "n_results": top_k
        }


        # ----------------------------------------------------
        # SOURCE FILTER
        # ----------------------------------------------------

        if source_urls:

            print(
                "Filtering search by sources:"
            )

            for source_url in source_urls:

                print(
                    f"  - {source_url}"
                )


            query_kwargs["where"] = {

                "source_url": {

                    "$in": source_urls

                }

            }


        else:

            print(
                "Searching entire knowledge base."
            )


        # ----------------------------------------------------
        # SEARCH CHROMADB
        # ----------------------------------------------------

        results = self.collection.query(
            **query_kwargs
        )


        # ----------------------------------------------------
        # DEBUG INFORMATION
        # ----------------------------------------------------

        found_documents = (
            results.get(
                "documents",
                [[]]
            )
        )


        if found_documents:

            print(
                f"Retrieved "
                f"{len(found_documents[0])} "
                f"chunks."
            )


        return results
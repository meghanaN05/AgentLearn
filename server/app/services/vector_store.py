from __future__ import annotations

import logging
import re
from dataclasses import dataclass

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import get_settings

settings = get_settings()

# chromadb 0.5.x still invokes its telemetry shim after telemetry is disabled and
# logs a TypeError for every call. Silence it so real log output stays readable.
logging.getLogger("chromadb.telemetry.product.posthog").setLevel(logging.CRITICAL)


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    user_id: str
    page_number: int
    content: str
    score: float


class VectorStore:
    def __init__(self) -> None:
        self._client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self._collections: dict[str, object] = {}

    def _collection_for(self, model_id: str):
        """One collection per embedding model.

        Vectors from different models have different dimensionality, so sharing
        a collection makes every query fail once the model changes. Keying by
        model keeps old vectors intact and simply leaves them unused until the
        affected documents are re-indexed.
        """
        suffix = re.sub(r"[^a-zA-Z0-9]+", "_", model_id).strip("_").lower()
        name = f"chunks_{suffix}"

        if name not in self._collections:
            self._collections[name] = self._client.get_or_create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"},
            )
        return self._collections[name]

    def upsert_chunks(
        self,
        *,
        user_id: str,
        document_id: str,
        chunks: list[dict],
        embeddings: list[list[float]],
        model_id: str,
    ) -> None:
        ids = [chunk["id"] for chunk in chunks]
        documents = [chunk["content"] for chunk in chunks]
        metadatas = [
            {
                "user_id": user_id,
                "document_id": document_id,
                "page_number": chunk["page_number"],
                "chunk_index": chunk["chunk_index"],
            }
            for chunk in chunks
        ]
        self._collection_for(model_id).upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def delete_document_chunks(
        self, document_id: str, user_id: str, model_id: str | None = None
    ) -> None:
        """Remove a document's vectors. Without a model_id every collection is
        swept, so vectors left behind by a previously configured model go too."""
        try:
            existing = self._client.list_collections()
        except Exception:
            logger.exception("Could not list vector collections")
            return

        where = {"$and": [{"document_id": document_id}, {"user_id": user_id}]}
        for collection in existing:
            name = collection if isinstance(collection, str) else collection.name
            if model_id is not None:
                suffix = re.sub(r"[^a-zA-Z0-9]+", "_", model_id).strip("_").lower()
                if name != f"chunks_{suffix}":
                    continue
            try:
                self._client.get_collection(name=name).delete(where=where)
            except Exception:
                logger.exception("Could not delete chunks from collection %s", name)

    def get_document_span(
        self,
        *,
        user_id: str,
        document_id: str,
        model_id: str,
        limit: int,
    ) -> list[RetrievedChunk]:
        """Chunks sampled evenly across a document, for whole-document tasks.

        Similarity search is the wrong tool for "summarise this document": a
        vague instruction has low similarity to any specific passage, so top-k
        returns an arbitrary corner of the text. Even sampling gives coverage.
        """
        try:
            results = self._collection_for(model_id).get(
                where={"$and": [{"user_id": user_id}, {"document_id": document_id}]},
                include=["documents", "metadatas"],
            )
        except Exception:
            logger.exception("Could not read document span for %s", document_id)
            return []

        ids = results.get("ids") or []
        if not ids:
            return []

        ordered = sorted(
            zip(ids, results["documents"], results["metadatas"]),
            key=lambda row: int(row[2].get("chunk_index", 0)),
        )

        if len(ordered) > limit:
            step = len(ordered) / limit
            ordered = [ordered[int(index * step)] for index in range(limit)]

        return [
            RetrievedChunk(
                chunk_id=chunk_id,
                document_id=metadata["document_id"],
                user_id=metadata["user_id"],
                page_number=int(metadata.get("page_number", 0)),
                content=content,
                # Not a similarity result; scored 1.0 so downstream filters and
                # the evaluator treat this as deliberately selected context.
                score=1.0,
            )
            for chunk_id, content, metadata in ordered
        ]

    def search(
        self,
        *,
        query_embedding: list[float],
        user_id: str,
        model_id: str,
        document_id: str | None = None,
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        top_k = top_k or settings.retrieval_top_k
        where: dict | None = {"user_id": user_id}
        if document_id:
            where = {"$and": [{"user_id": user_id}, {"document_id": document_id}]}

        results = self._collection_for(model_id).query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        retrieved: list[RetrievedChunk] = []
        if not results["ids"] or not results["ids"][0]:
            return retrieved

        for idx, chunk_id in enumerate(results["ids"][0]):
            metadata = results["metadatas"][0][idx]
            distance = results["distances"][0][idx]
            score = max(0.0, 1.0 - distance)
            retrieved.append(
                RetrievedChunk(
                    chunk_id=chunk_id,
                    document_id=metadata["document_id"],
                    user_id=metadata["user_id"],
                    page_number=int(metadata.get("page_number", 0)),
                    content=results["documents"][0][idx],
                    score=score,
                )
            )
        return retrieved


vector_store = VectorStore()

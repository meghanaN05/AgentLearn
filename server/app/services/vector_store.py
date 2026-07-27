from __future__ import annotations

import uuid
from dataclasses import dataclass

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import get_settings

settings = get_settings()


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
        self._collection = self._client.get_or_create_collection(
            name="document_chunks",
            metadata={"hnsw:space": "cosine"},
        )

    def upsert_chunks(
        self,
        *,
        user_id: str,
        document_id: str,
        chunks: list[dict],
        embeddings: list[list[float]],
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
        self._collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )

    def delete_document_chunks(self, document_id: str, user_id: str) -> None:
        try:
            self._collection.delete(
                where={"$and": [{"document_id": document_id}, {"user_id": user_id}]}
            )
        except Exception:
            pass

    def search(
        self,
        *,
        query_embedding: list[float],
        user_id: str,
        document_id: str | None = None,
        top_k: int | None = None,
    ) -> list[RetrievedChunk]:
        top_k = top_k or settings.retrieval_top_k
        where: dict | None = {"user_id": user_id}
        if document_id:
            where = {"$and": [{"user_id": user_id}, {"document_id": document_id}]}

        results = self._collection.query(
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

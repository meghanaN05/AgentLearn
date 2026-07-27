from __future__ import annotations

from functools import lru_cache

from app.config import get_settings

settings = get_settings()


class EmbeddingService:
    def __init__(self) -> None:
        self._openai_client = None
        self._local_model = None

        if settings.openai_api_key and not settings.use_local_embeddings:
            from openai import OpenAI

            self._openai_client = OpenAI(api_key=settings.openai_api_key)
        else:
            from sentence_transformers import SentenceTransformer

            self._local_model = SentenceTransformer(settings.local_embedding_model)

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        if self._openai_client is not None:
            response = self._openai_client.embeddings.create(
                model=settings.embedding_model,
                input=texts,
            )
            return [item.embedding for item in response.data]

        assert self._local_model is not None
        vectors = self._local_model.encode(texts, normalize_embeddings=True)
        return [vector.tolist() for vector in vectors]

    def embed_query(self, query: str) -> list[float]:
        return self.embed_texts([query])[0]


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()

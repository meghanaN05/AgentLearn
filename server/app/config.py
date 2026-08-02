from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "AgentLearn"
    debug: bool = True
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    algorithm: str = "HS256"

    # Host port 5433 matches docker-compose, which avoids a local Postgres on 5432.
    database_url: str = "postgresql://agentlearn:agentlearn@localhost:5433/agentlearn"

    upload_dir: str = "./uploads"
    max_upload_size_mb: int = 20

    openai_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    use_local_embeddings: bool = False
    local_embedding_model: str = "BAAI/bge-small-en-v1.5"

    chunk_size: int = 800
    chunk_overlap: int = 150

    chroma_persist_dir: str = "./chroma_data"
    retrieval_top_k: int = 5
    retrieval_confidence_threshold: float = 0.65
    # Below this score a chunk is dropped before it ever reaches the LLM.
    retrieval_min_score: float = 0.15

    tavily_api_key: str = ""
    enable_external_search: bool = True

    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()

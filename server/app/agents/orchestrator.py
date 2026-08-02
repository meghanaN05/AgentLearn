from __future__ import annotations

import time
import uuid
from dataclasses import dataclass

from app.config import get_settings
from app.services.embedding_service import get_embedding_service
from app.services.llm_service import llm_service
from app.services.search_service import external_search_service, retrieval_evaluator
from app.services.vector_store import RetrievedChunk, vector_store

settings = get_settings()


@dataclass
class AgentResponse:
    answer: str
    sources: list[str]
    retrieved_chunks: list[dict]
    external_search_used: bool
    tokens_used: int
    latency_ms: int
    relevance: str
    confidence: float


class AgentOrchestrator:
    """Coordinates retrieval, evaluation, external search, and response generation."""

    @property
    def embeddings(self):
        # Resolved lazily: loading a local sentence-transformers model at import
        # time would stall app startup before the first request even arrives.
        return get_embedding_service()

    def run(
        self,
        *,
        query: str,
        user_id: str,
        document_id: str | None = None,
        conversation_history: list[dict] | None = None,
        task: str = "chat",
        extra_instructions: str = "",
        json_mode: bool | None = None,
        whole_document: bool = False,
    ) -> AgentResponse:
        start = time.perf_counter()
        conversation_history = conversation_history or []

        # Agent 1 — Retrieval. Scoped to the active embedding model so a query
        # is never compared against vectors produced by a different one.
        if whole_document and document_id:
            # Summaries and question sets covering a whole document need spread,
            # not similarity to a vague instruction.
            chunks = vector_store.get_document_span(
                user_id=user_id,
                document_id=document_id,
                model_id=self.embeddings.model_id,
                limit=settings.coverage_chunk_limit,
            )
        else:
            query_embedding = self.embeddings.embed_query(query)
            chunks = vector_store.search(
                query_embedding=query_embedding,
                user_id=user_id,
                model_id=self.embeddings.model_id,
                document_id=document_id,
            )
            chunks = [
                chunk for chunk in chunks if chunk.score >= settings.retrieval_min_score
            ]

        # Agent 2 — Retrieval evaluation.
        relevance, confidence = retrieval_evaluator.evaluate_with_llm(query, chunks)
        external_context = ""
        external_sources: list[str] = []
        external_search_used = False

        # Agent 3 — External search, only when the knowledge base falls short.
        if retrieval_evaluator.should_search_externally(
            relevance, confidence, has_llm=llm_service.is_available
        ):
            external_context, external_sources = external_search_service.search(query)
            external_search_used = bool(external_context)

        context_blocks = self._format_chunks(chunks)
        if external_context:
            context_blocks += f"\n\nExternal sources:\n{external_context}"

        system_prompt = self._build_system_prompt(task, extra_instructions)
        history_text = self._format_history(conversation_history)
        user_prompt = (
            f"{history_text}\nUser query: {query}\n\nContext:\n{context_blocks or 'No context available.'}"
        )

        # Agent 4 — Response generation. Structured tasks parse the reply as JSON,
        # so ask the model for JSON natively rather than scraping it back out of prose.
        if json_mode is None:
            json_mode = task in ("structured", "recommendation")

        answer, tokens = llm_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2 if task == "chat" else 0.4,
            json_mode=json_mode,
        )

        sources = [f"Page {chunk.page_number}" for chunk in chunks[:5]]
        sources.extend(external_sources[:3])

        latency_ms = int((time.perf_counter() - start) * 1000)
        return AgentResponse(
            answer=answer,
            sources=sources,
            retrieved_chunks=[
                {
                    "chunk_id": chunk.chunk_id,
                    "document_id": chunk.document_id,
                    "page_number": chunk.page_number,
                    "score": chunk.score,
                    "preview": chunk.content[:200],
                }
                for chunk in chunks
            ],
            external_search_used=external_search_used,
            tokens_used=tokens,
            latency_ms=latency_ms,
            relevance=relevance,
            confidence=confidence,
        )

    def generate_structured_json(
        self,
        *,
        query: str,
        user_id: str,
        document_id: str,
        system_prompt: str,
        extra_instructions: str = "",
    ) -> tuple[dict, AgentResponse]:
        response = self.run(
            query=query,
            user_id=user_id,
            document_id=document_id,
            task="structured",
            extra_instructions=extra_instructions,
        )
        parsed = llm_service.parse_json(response.answer)
        return parsed, response

    @staticmethod
    def _format_chunks(chunks: list[RetrievedChunk]) -> str:
        if not chunks:
            return ""
        return "\n\n".join(
            f"[Doc chunk | page {chunk.page_number} | score {chunk.score:.2f}]\n{chunk.content}"
            for chunk in chunks
        )

    @staticmethod
    def _format_history(history: list[dict]) -> str:
        if not history:
            return ""
        lines = []
        for item in history[-6:]:
            role = item.get("role", "user")
            content = item.get("content", "")
            lines.append(f"{role.upper()}: {content}")
        return "Conversation history:\n" + "\n".join(lines)

    @staticmethod
    def _build_system_prompt(task: str, extra_instructions: str) -> str:
        base = (
            "You are AgentLearn, an adaptive study assistant. "
            "Prefer uploaded document context when it is relevant. "
            "If external context is included, integrate it carefully and cite when useful. "
            "Be accurate, educational, and concise."
        )
        task_prompts = {
            "chat": "Answer the student's question clearly with examples when helpful.",
            "summary": "Generate a high-quality study summary from the provided context.",
            "mcq": "Generate diverse multiple-choice questions grounded in the context.",
            "mocktest": "Generate exam-style MCQs with one clearly correct answer.",
            "recommendation": "Create actionable study recommendations based on performance.",
            "structured": "Return valid JSON only, matching the requested schema exactly.",
        }
        prompt = f"{base}\n{task_prompts.get(task, task_prompts['chat'])}"
        if extra_instructions:
            prompt += f"\n{extra_instructions}"
        return prompt


agent_orchestrator = AgentOrchestrator()

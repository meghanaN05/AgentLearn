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

    def __init__(self) -> None:
        self.embeddings = get_embedding_service()

    def run(
        self,
        *,
        query: str,
        user_id: str,
        document_id: str | None = None,
        conversation_history: list[dict] | None = None,
        task: str = "chat",
        extra_instructions: str = "",
    ) -> AgentResponse:
        start = time.perf_counter()
        conversation_history = conversation_history or []

        query_embedding = self.embeddings.embed_query(query)
        chunks = vector_store.search(
            query_embedding=query_embedding,
            user_id=user_id,
            document_id=document_id,
        )

        relevance, confidence = retrieval_evaluator.evaluate_with_llm(query, chunks)
        external_context = ""
        external_sources: list[str] = []
        external_search_used = False

        if relevance == "not_relevant" or confidence < settings.retrieval_confidence_threshold:
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

        answer, tokens = llm_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2 if task == "chat" else 0.4,
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

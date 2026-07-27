from __future__ import annotations

from app.config import get_settings
from app.services.llm_service import llm_service
from app.services.vector_store import RetrievedChunk

settings = get_settings()


class ExternalSearchService:
    def search(self, query: str, max_results: int = 5) -> tuple[str, list[str]]:
        if not settings.enable_external_search or not settings.tavily_api_key:
            return "", []

        try:
            from tavily import TavilyClient

            client = TavilyClient(api_key=settings.tavily_api_key)
            response = client.search(query=query, max_results=max_results)
            sources: list[str] = []
            snippets: list[str] = []

            for result in response.get("results", []):
                title = result.get("title", "Source")
                url = result.get("url", "")
                content = result.get("content", "")
                snippets.append(f"{title}: {content}")
                if url:
                    sources.append(url)

            return "\n\n".join(snippets), sources
        except Exception:
            return "", []


external_search_service = ExternalSearchService()


class RetrievalEvaluator:
    def evaluate(self, query: str, chunks: list[RetrievedChunk]) -> tuple[str, float]:
        if not chunks:
            return "not_relevant", 0.0

        avg_score = sum(chunk.score for chunk in chunks) / len(chunks)
        top_score = max(chunk.score for chunk in chunks)

        if top_score >= settings.retrieval_confidence_threshold:
            return "relevant", top_score
        if avg_score >= settings.retrieval_confidence_threshold * 0.75:
            return "partially_relevant", avg_score
        return "not_relevant", avg_score

    def evaluate_with_llm(self, query: str, chunks: list[RetrievedChunk]) -> tuple[str, float]:
        heuristic_label, heuristic_score = self.evaluate(query, chunks)
        if not llm_service.is_available or not chunks:
            return heuristic_label, heuristic_score

        context = "\n\n".join(chunk.content[:400] for chunk in chunks[:3])
        system_prompt = (
            "You evaluate whether retrieved document chunks can answer a user query. "
            "Respond in JSON with keys: relevance (relevant|partially_relevant|not_relevant), "
            "confidence (0-1 float)."
        )
        user_prompt = f"Query: {query}\n\nRetrieved context:\n{context}"
        content, _ = llm_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
            json_mode=True,
        )
        try:
            parsed = llm_service.parse_json(content)
            return parsed.get("relevance", heuristic_label), float(
                parsed.get("confidence", heuristic_score)
            )
        except Exception:
            return heuristic_label, heuristic_score


retrieval_evaluator = RetrievalEvaluator()

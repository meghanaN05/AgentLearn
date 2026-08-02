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
    """Agent 2 — decides whether retrieved chunks can answer the query."""

    def evaluate(self, query: str, chunks: list[RetrievedChunk]) -> tuple[str, float]:
        """Similarity-only fallback, used when no LLM is configured.

        Absolute cosine values are model-dependent: text-embedding-3-small puts
        good matches near 0.55 while normalised local models score far higher.
        The threshold therefore lives in config and must be tuned per model.
        """
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

        # Chunks run to several thousand characters. Judging a short prefix
        # rates the wrong text -- the answer often sits past the cut -- so send
        # a substantial slice of each of the top chunks.
        context = "\n\n---\n\n".join(
            f"[chunk {index + 1}, page {chunk.page_number}]\n"
            f"{chunk.content[: settings.evaluator_chunk_chars]}"
            for index, chunk in enumerate(chunks[: settings.evaluator_max_chunks])
        )
        system_prompt = (
            "You judge whether retrieved document excerpts contain enough information "
            "to answer a user's question. The excerpts may be truncated mid-sentence and "
            "may include unrelated surrounding text; judge only whether the relevant facts "
            "are present somewhere in them. Reply with JSON: relevance "
            "(relevant|partially_relevant|not_relevant) and confidence (0-1 float) "
            "expressing how sure you are of that judgement."
        )
        user_prompt = f"Question: {query}\n\nRetrieved excerpts:\n{context}"
        content, _ = llm_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
            json_mode=True,
        )
        try:
            parsed = llm_service.parse_json(content)
            label = parsed.get("relevance", heuristic_label)
            if label not in ("relevant", "partially_relevant", "not_relevant"):
                label = heuristic_label
            return label, float(parsed.get("confidence", heuristic_score))
        except Exception:
            return heuristic_label, heuristic_score

    @staticmethod
    def should_search_externally(relevance: str, confidence: float, has_llm: bool) -> bool:
        """Whether Agent 3 should run.

        When an LLM produced the verdict, trust its label: its confidence is a
        self-assessment, not a similarity score, so comparing it against the
        cosine threshold would mix two unrelated scales and fire a web search
        on nearly every query.
        """
        if relevance == "not_relevant":
            return True
        if has_llm:
            return relevance == "partially_relevant" and confidence < 0.4
        return confidence < settings.retrieval_confidence_threshold


retrieval_evaluator = RetrievalEvaluator()

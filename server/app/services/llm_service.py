from __future__ import annotations

import json
import re
from typing import Any

from app.config import get_settings

settings = get_settings()


class LLMUnavailableError(RuntimeError):
    """Raised when a generation is attempted without a configured LLM."""


class LLMService:
    def __init__(self) -> None:
        self._client = None
        if settings.openai_api_key:
            from openai import OpenAI

            self._client = OpenAI(api_key=settings.openai_api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    def generate(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        json_mode: bool = False,
    ) -> tuple[str, int]:
        if self._client is None:
            # Surfaced as HTTP 503 by the routers. Returning placeholder prose
            # here would get persisted as if it were a real assistant answer.
            raise LLMUnavailableError(
                "AI generation is unavailable. Set OPENAI_API_KEY in server/.env "
                "to enable chat, summaries, MCQs, and recommendations."
            )

        kwargs: dict[str, Any] = {
            "model": settings.llm_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = self._client.chat.completions.create(**kwargs)
        content = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens if response.usage else 0
        return content, tokens

    @staticmethod
    def parse_json(content: str) -> dict:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", content, re.DOTALL)
            if match:
                return json.loads(match.group())
            raise


llm_service = LLMService()

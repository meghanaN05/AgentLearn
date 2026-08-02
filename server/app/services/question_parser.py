from __future__ import annotations

import uuid


def normalize_questions(raw_questions: list) -> list[dict]:
    """Validate and de-duplicate LLM-generated MCQs.

    Shared by the MCQ and mock-test routes so both reject the same malformed
    output. Model-supplied ids are discarded: they collide across generations,
    which would let one set's answers be graded against another's.
    """
    normalized: list[dict] = []
    seen_questions: set[str] = set()

    for item in raw_questions:
        if not isinstance(item, dict):
            continue

        question = str(item.get("question", "")).strip()
        options = item.get("options")
        correct = item.get("correctAnswer")

        # Exactly four options, and a correct index that actually points at one.
        if not question or not isinstance(options, list) or len(options) != 4:
            continue
        if isinstance(correct, bool) or not isinstance(correct, int):
            continue
        if not 0 <= correct < len(options):
            continue

        key = question.casefold()
        if key in seen_questions:
            continue
        seen_questions.add(key)

        normalized.append(
            {
                "id": str(uuid.uuid4()),
                "question": question,
                "options": [str(option) for option in options],
                "correctAnswer": correct,
                "explanation": item.get("explanation"),
                "topic": str(item.get("topic") or "General"),
            }
        )

    return normalized

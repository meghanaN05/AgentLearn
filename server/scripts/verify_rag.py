"""In-process verification of the RAG + agent pipeline using a stubbed LLM.

Exercises the paths that need text generation without spending API credits or
requiring OPENAI_API_KEY. Run from the server/ directory:

    ./.venv/bin/python scripts/verify_rag.py
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402

from app.services import llm_service as llm_module  # noqa: E402

CALLS: list[dict] = []
FAILURES: list[str] = []


def check(label: str, ok: bool, detail: str = "") -> None:
    print(f"[{'PASS' if ok else 'FAIL'}] {label}" + (f" -- {detail}" if detail else ""))
    if not ok:
        FAILURES.append(label)


def stub_generate(*, system_prompt, user_prompt, temperature=0.3, json_mode=False):
    """Stand-in for the real LLM that records how it was invoked."""
    CALLS.append({"system": system_prompt, "user": user_prompt, "json_mode": json_mode})

    if "relevance" in system_prompt:
        return json.dumps({"relevance": "relevant", "confidence": 0.9}), 10

    if "questions" in system_prompt:
        # Two valid questions, one malformed (3 options) that must be dropped,
        # and one duplicate of the first that must be de-duplicated.
        return json.dumps(
            {
                "questions": [
                    {
                        "question": "What is a leaf node?",
                        "options": ["No children", "Two children", "One child", "Root"],
                        "correctAnswer": 0,
                        "explanation": "A leaf has no children.",
                        "topic": "Binary Trees",
                    },
                    {
                        "question": "In-order traversal of a BST yields?",
                        "options": ["Sorted", "Reversed", "Random", "Level order"],
                        "correctAnswer": 0,
                        "explanation": "In-order visits left, node, right.",
                        "topic": "Traversal",
                    },
                    {
                        "question": "Malformed question",
                        "options": ["a", "b", "c"],
                        "correctAnswer": 0,
                        "topic": "Bad",
                    },
                    {
                        "question": "what is a LEAF node?",
                        "options": ["No children", "Two", "One", "Root"],
                        "correctAnswer": 0,
                        "topic": "Binary Trees",
                    },
                ]
            }
        ), 50

    # Chat / summary: echo the context so retrieval can be asserted on.
    return f"STUB_ANSWER::{user_prompt[:4000]}", 20


llm_module.llm_service._client = object()  # make is_available report True
llm_module.llm_service.generate = stub_generate

from app.main import app  # noqa: E402

client = TestClient(app)
stamp = str(int(time.time()))

# --- Setup: user + processed document ---------------------------------
r = client.post(
    "/api/auth/register",
    json={"name": "RAG Tester", "email": f"rag{stamp}@example.com", "password": "secret123"},
)
H = {"Authorization": f"Bearer {r.json()['access_token']}"}

with open("/tmp/al_test.pdf", "rb") as fh:
    r = client.post(
        "/api/pdf/upload", headers=H, files={"file": ("trees.pdf", fh, "application/pdf")}
    )
doc_id = r.json()["id"]

for _ in range(120):
    status = client.get(f"/api/pdf/{doc_id}", headers=H).json()
    if status["processing_status"] in ("completed", "failed"):
        break
    time.sleep(1)
check("document processed", status["processing_status"] == "completed", str(status))

# --- Retrieval grounding ----------------------------------------------
CALLS.clear()
r = client.post(
    "/api/chat", headers=H, json={"message": "What is in-order traversal?", "pdfId": doc_id}
)
check("chat 200", r.status_code == 200, r.text[:200])
body = r.json()

check("sources cite pages", any(s.startswith("Page ") for s in body["sources"]), str(body["sources"]))
check(
    "page numbers are real, not all page 1",
    all(s.startswith("Page ") and int(s.split()[1]) >= 1 for s in body["sources"] if s.startswith("Page ")),
    str(body["sources"]),
)

gen_call = CALLS[-1]
check(
    "retrieved document text reached the prompt",
    "traversal" in gen_call["user"].lower() and "Doc chunk" in gen_call["user"],
    gen_call["user"][:160],
)
check("chat is not asked for JSON", gen_call["json_mode"] is False)
check(
    "external search skipped when retrieval is confident",
    body["externalSearchUsed"] is False,
)

# --- Structured generation uses native JSON mode ----------------------
CALLS.clear()
r = client.post(
    "/api/mcq",
    headers=H,
    json={"pdfId": doc_id, "difficulty": "medium", "numberOfQuestions": 4},
)
check("mcq 200", r.status_code == 200, r.text[:200])
mcq = r.json()
check("MCQ generation requests JSON mode", CALLS[-1]["json_mode"] is True)
check("malformed + duplicate questions dropped", len(mcq["questions"]) == 2, str(len(mcq["questions"])))
check("setId returned", bool(mcq.get("setId")))
check(
    "answer key withheld from client",
    all(q.get("correctAnswer") is None for q in mcq["questions"]),
)

# --- Grading: unanswered questions must still count -------------------
qs = mcq["questions"]
r = client.post(
    "/api/mcq/submit",
    headers=H,
    json={"setId": mcq["setId"], "answers": [{"questionId": qs[0]["id"], "selectedOption": 0}]},
)
graded = r.json()
check("grades against full set, not just submitted", graded["total"] == 2, str(graded["total"]))
check("one correct", graded["correctAnswers"] == 1, str(graded["correctAnswers"]))
check("one unanswered", graded["unanswered"] == 1, str(graded["unanswered"]))
check("skipping does not inflate score", graded["score"] == 50.0, str(graded["score"]))
check("explanations revealed after submit", any(g["explanation"] for g in graded["results"]))

# --- Deleting a chatted-about PDF preserves history -------------------
r = client.delete(f"/api/pdf/{doc_id}", headers=H)
check("delete PDF with chat + MCQ history", r.status_code == 204, r.text[:200])
check("chat session survives", len(client.get("/api/chat/sessions", headers=H).json()) == 1)

print()
if FAILURES:
    print(f"{len(FAILURES)} FAILED: {FAILURES}")
    sys.exit(1)
print("ALL PASSED")

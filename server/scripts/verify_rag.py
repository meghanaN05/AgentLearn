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

    if "studyPlan" in system_prompt:
        return json.dumps(
            {
                "recommendations": [
                    {
                        "title": "Revise tree traversal",
                        "description": "Work through in-order and post-order examples.",
                        "priority": "High",
                        "topic": "Traversal",
                    }
                ],
                "studyPlan": [
                    {"topic": "Traversal", "duration": "45 min", "completed": False},
                    {"topic": "Binary Trees", "duration": "30 min", "completed": False},
                ],
            }
        ), 40

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

# --- Chat sessions: rename and isolation ------------------------------
sessions = client.get("/api/chat/sessions", headers=H).json()
check("session listed", len(sessions) == 1, str(len(sessions)))
original_title = sessions[0]["title"]

r = client.patch(
    f"/api/chat/sessions/{sessions[0]['id']}",
    headers=H,
    json={"title": "Traversal revision"},
)
check("rename chat 200", r.status_code == 200, r.text[:160])
check("title updated", r.json()["title"] == "Traversal revision", r.json()["title"])
check("rename actually persisted",
      client.get("/api/chat/sessions", headers=H).json()[0]["title"] == "Traversal revision",
      original_title)

# A second user must not be able to rename someone else's chat.
r = client.post(
    "/api/auth/register",
    json={"name": "Other", "email": f"other{stamp}@example.com", "password": "secret123"},
)
OTHER = {"Authorization": f"Bearer {r.json()['access_token']}"}
r = client.patch(
    f"/api/chat/sessions/{sessions[0]['id']}", headers=OTHER, json={"title": "hijacked"}
)
check("cannot rename another user's chat", r.status_code == 404, str(r.status_code))

r = client.patch(
    f"/api/chat/sessions/{sessions[0]['id']}", headers=H, json={"title": "   "}
)
check("blank title rejected", r.status_code == 422, str(r.status_code))

# --- Summary ----------------------------------------------------------
r = client.post(
    "/api/summary", headers=H, json={"pdfId": doc_id, "summaryType": "short"}
)
check("summary 200", r.status_code == 200, r.text[:160])
check("summary grounded in the document", "Doc chunk" in r.json()["summary"],
      r.json()["summary"][:120])

# --- Mock test: generate -> submit -> history -------------------------
r = client.post(
    "/api/mocktest",
    headers=H,
    json={"pdfId": doc_id, "difficulty": "medium", "numberOfQuestions": 4},
)
check("mocktest 200", r.status_code == 200, r.text[:200])
test = r.json()
test_questions = test["questions"]
check("mocktest drops malformed + duplicate questions", len(test_questions) == 2,
      str(len(test_questions)))
check(
    "mocktest answer key withheld",
    all("correctAnswer" not in q for q in test_questions),
)

# Answer the first correctly (stub key is index 0) and the second wrongly.
r = client.post(
    "/api/mocktest/submit",
    headers=H,
    json={
        "testId": test["testId"],
        "answers": [
            {"questionId": test_questions[0]["id"], "selectedOption": 0},
            {"questionId": test_questions[1]["id"], "selectedOption": 3},
        ],
        "timeTakenSeconds": 300,
    },
)
check("mocktest submit 200", r.status_code == 200, r.text[:200])
graded_test = r.json()
check("scored over the full test", graded_test["totalQuestions"] == len(test_questions),
      str(graded_test["totalQuestions"]))
check("no malformed topic leaked into grading",
      "Bad" not in graded_test["weakTopics"] + graded_test["strongTopics"],
      str(graded_test))
check("one correct answer", graded_test["correctAnswers"] == 1, str(graded_test["correctAnswers"]))
check("weak topic captured", len(graded_test["weakTopics"]) >= 1, str(graded_test["weakTopics"]))
check("strong topic captured", len(graded_test["strongTopics"]) >= 1,
      str(graded_test["strongTopics"]))

r = client.get("/api/mocktest/attempts", headers=H)
attempts = r.json()
check("attempt history records the test", len(attempts) == 1, str(len(attempts)))
check("measured time persisted", attempts[0]["timeTakenSeconds"] == 300,
      str(attempts[0]["timeTakenSeconds"]))

# --- Analytics reflects the real attempt ------------------------------
a = client.get("/api/analytics", headers=H).json()
check("studyHours from measured test time", a["studyHours"] == round(300 / 3600, 2),
      str(a["studyHours"]))
check("score history populated", len(a["scoreHistory"]) == 1, str(a["scoreHistory"]))
check("topic accuracy computed from answers", len(a["topicPerformance"]) >= 1,
      str(a["topicPerformance"]))
check("daily activity covers 7 days", len(a["dailyActivity"]) == 7, str(len(a["dailyActivity"])))
check("summaries counted", a["summariesGenerated"] == 1, str(a["summariesGenerated"]))

# --- Recommendations --------------------------------------------------
r = client.post("/api/recommendations/refresh", headers=H)
check("recommendations refresh 200", r.status_code == 200, r.text[:200])
recs = r.json()
check("recommendation generated", len(recs["recommendations"]) == 1,
      str(len(recs["recommendations"])))
check("study plan generated", len(recs["studyPlan"]) == 2, str(len(recs["studyPlan"])))

r = client.get("/api/recommendations", headers=H)
check("recommendations persisted", len(r.json()["recommendations"]) == 1,
      str(len(r.json()["recommendations"])))

# --- Deleting a chatted-about PDF preserves history -------------------
r = client.delete(f"/api/pdf/{doc_id}", headers=H)
check("delete PDF with chat + MCQ + test history", r.status_code == 204, r.text[:200])
check("chat session survives", len(client.get("/api/chat/sessions", headers=H).json()) == 1)
check("test history survives", len(client.get("/api/mocktest/attempts", headers=H).json()) == 1)

print()
if FAILURES:
    print(f"{len(FAILURES)} FAILED: {FAILURES}")
    sys.exit(1)
print("ALL PASSED")

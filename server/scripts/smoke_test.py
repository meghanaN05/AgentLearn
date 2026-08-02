"""End-to-end smoke test for AgentLearn against a running server.

Covers auth, user isolation, PDF upload and async processing, search, chat
sessions and analytics over real HTTP. Steps that need text generation are
skipped when OPENAI_API_KEY is not configured -- run scripts/verify_rag.py to
exercise those with a stubbed LLM.

    ./.venv/bin/uvicorn app.main:app --port 8000    # in one shell
    ./.venv/bin/python scripts/smoke_test.py        # in another
"""
import sys
import time

import httpx

BASE = "http://127.0.0.1:8000/api"
c = httpx.Client(base_url=BASE, timeout=120.0)
stamp = str(int(time.time()))
failures = []
skipped = []

LLM_ENABLED = httpx.get("http://127.0.0.1:8000/health", timeout=10.0).json()["llm"]


def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" -- {detail}" if detail else ""))
    if not condition:
        failures.append(label)


def skip(label, reason):
    print(f"[SKIP] {label} -- {reason}")
    skipped.append(label)


# --- Auth -------------------------------------------------------------
alice = {"name": "Alice Test", "email": f"alice{stamp}@example.com", "password": "secret123"}
bob = {"name": "Bob Test", "email": f"bob{stamp}@example.com", "password": "secret123"}

r = c.post("/auth/register", json=alice)
check("register alice", r.status_code == 201, f"{r.status_code} {r.text[:120]}")
a_tok = r.json()["access_token"]
A = {"Authorization": f"Bearer {a_tok}"}

r = c.post("/auth/register", json=bob)
check("register bob", r.status_code == 201, str(r.status_code))
B = {"Authorization": f"Bearer {r.json()['access_token']}"}

r = c.post("/auth/register", json=alice)
check("duplicate email rejected", r.status_code == 400, str(r.status_code))

r = c.post("/auth/login", json={"email": alice["email"], "password": "wrong"})
check("bad password rejected", r.status_code == 401, str(r.status_code))

r = c.get("/auth/profile")
check("unauthenticated profile blocked", r.status_code == 401, str(r.status_code))

r = c.get("/auth/profile", headers=A)
check("profile returns owner", r.json()["user"]["email"] == alice["email"])

# --- Profile update ---------------------------------------------------
r = c.patch("/auth/profile", headers=A, json={"name": "Alice Renamed"})
check("profile rename", r.status_code == 200 and r.json()["user"]["name"] == "Alice Renamed", r.text[:120])

r = c.patch("/auth/profile", headers=A, json={"password": "newsecret1", "currentPassword": "nope"})
check("password change needs current password", r.status_code == 400, str(r.status_code))

# --- PDF upload + async processing -----------------------------------
with open("/tmp/al_test.pdf", "rb") as fh:
    r = c.post("/pdf/upload", headers=A, files={"file": ("trees.pdf", fh, "application/pdf")})
check("upload accepted", r.status_code == 201, f"{r.status_code} {r.text[:160]}")
doc_id = r.json()["id"]
check("upload returns immediately as processing", r.json()["processing_status"] == "processing",
      r.json()["processing_status"])

status = None
for _ in range(60):
    time.sleep(1)
    status = c.get(f"/pdf/{doc_id}", headers=A).json()
    if status["processing_status"] in ("completed", "failed"):
        break
check("processing completes", status["processing_status"] == "completed",
      f"{status['processing_status']} {status.get('processing_error')}")
check("page count recorded", status["pages"] >= 1, str(status["pages"]))

# --- Non-PDF rejected -------------------------------------------------
r = c.post("/pdf/upload", headers=A, files={"file": ("x.pdf", b"not a pdf at all", "application/pdf")})
check("non-PDF content rejected", r.status_code == 400, str(r.status_code))

# --- Listing + search -------------------------------------------------
r = c.get("/pdf", headers=A)
check("list returns the doc", any(d["id"] == doc_id for d in r.json()))

r = c.get("/pdf", headers=A, params={"search": "tree"})
check("search matches filename", len(r.json()) == 1, str(len(r.json())))

r = c.get("/pdf", headers=A, params={"search": "zzzznope"})
check("search excludes non-matches", len(r.json()) == 0, str(len(r.json())))

# --- User isolation ---------------------------------------------------
r = c.get("/pdf", headers=B)
check("bob sees no documents", r.json() == [], str(r.json())[:80])

r = c.get(f"/pdf/{doc_id}", headers=B)
check("bob cannot read alice's doc", r.status_code == 404, str(r.status_code))

r = c.delete(f"/pdf/{doc_id}", headers=B)
check("bob cannot delete alice's doc", r.status_code == 404, str(r.status_code))

# --- Chat + retrieval (needs an LLM) ----------------------------------
expected_questions = 0

if not LLM_ENABLED:
    r = c.post("/chat", headers=A, json={"message": "anything", "pdfId": doc_id})
    check("chat reports 503 when no LLM is configured", r.status_code == 503, str(r.status_code))
    check(
        "failed chat leaves no empty session behind",
        c.get("/chat/sessions", headers=A).json() == [],
        str(c.get("/chat/sessions", headers=A).json())[:120],
    )
    skip("retrieval, sessions and chat history", "OPENAI_API_KEY not set")
else:
    r = c.post(
        "/chat", headers=A, json={"message": "What is an in-order traversal?", "pdfId": doc_id}
    )
    check("chat responds", r.status_code == 200, f"{r.status_code} {r.text[:160]}")
    body = r.json()
    session_id = body["sessionId"]
    check("chat cites document pages", any(s.startswith("Page ") for s in body["sources"]),
          str(body["sources"]))

    r = c.get("/chat/sessions", headers=A)
    check("session list populated", len(r.json()) == 1 and r.json()[0]["id"] == session_id)
    check("session message count", r.json()[0]["messageCount"] == 2, str(r.json()[0]["messageCount"]))

    r = c.get("/chat/sessions", headers=A, params={"search": "in-order"})
    check("session search by message text", len(r.json()) == 1, str(len(r.json())))

    r = c.get("/chat/sessions", headers=B)
    check("bob sees no sessions", r.json() == [])

    r = c.get(f"/chat/history/{session_id}", headers=B)
    check("bob cannot read alice's chat", r.status_code == 404, str(r.status_code))

    r = c.post("/chat", headers=A, json={"message": "And pre-order?", "sessionId": session_id})
    check("continue existing session", r.json()["sessionId"] == session_id)
    r = c.get(f"/chat/history/{session_id}", headers=A)
    check("history grows and is ordered", len(r.json()) == 4 and r.json()[0]["role"] == "user",
          str([m["role"] for m in r.json()]))
    expected_questions = 2

# --- Analytics --------------------------------------------------------
r = c.get("/analytics", headers=A)
a = r.json()
check("analytics counts pdfs", a["totalPDFs"] == 1, str(a["totalPDFs"]))
check("analytics counts questions asked", a["questionsAsked"] == expected_questions,
      str(a["questionsAsked"]))
check("analytics streak is 1 today", a["learningStreak"] == 1, str(a["learningStreak"]))
check("studyHours is measured, not fabricated", a["studyHours"] == 0.0, str(a["studyHours"]))

r = c.get("/analytics", headers=B)
check("bob analytics isolated", r.json()["totalPDFs"] == 0)

# --- Cleanup ----------------------------------------------------------
r = c.delete(f"/pdf/{doc_id}", headers=A)
check("owner can delete", r.status_code == 204, str(r.status_code))

print()
if skipped:
    print(f"{len(skipped)} skipped (no LLM configured): {skipped}")
if failures:
    print(f"{len(failures)} FAILED: {failures}")
    sys.exit(1)
print("ALL PASSED")

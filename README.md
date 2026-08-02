# AgentLearn

AI-powered adaptive learning platform combining **RAG** (Retrieval-Augmented Generation) with **Agentic AI** to turn uploaded study materials into an interactive learning experience.

## Architecture

```
React (Vite) Frontend
        │
        ▼
FastAPI Backend (/api)
        │
   ┌────┴────┬──────────────┬─────────────┐
   ▼         ▼              ▼             ▼
PostgreSQL  ChromaDB    OpenAI LLM    Tavily Search
(users,     (vectors)   (optional)    (optional)
 docs,
 chats,
 tests)
```

### Agent Workflow

1. **Retrieval Agent** — semantic search over user document chunks (ChromaDB)
2. **Retrieval Evaluator** — decides if context is sufficient
3. **External Search Agent** — Tavily web search when documents lack coverage
4. **Response Generator** — produces chat answers, summaries, MCQs, recommendations

Every record is scoped by `user_id` for complete data isolation.

## Project Structure

```
AgentLearn/
├── client/          # React + Vite + Tailwind frontend
├── server/          # FastAPI backend + agents + RAG pipeline
└── docker-compose.yml
```

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This publishes Postgres on **host port 5433** so it does not collide with a
local Postgres install on 5432.

### 2. Backend

```bash
cd server
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env
```

Edit `server/.env`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | For AI features | Chat, summaries, MCQs, mock tests, recommendations. Without it those endpoints return **503**; upload, search, auth and analytics still work. |
| `DATABASE_URL` | No | Defaults to `postgresql://agentlearn:agentlearn@localhost:5433/agentlearn`. |
| `TAVILY_API_KEY` | No | Enables the External Search Agent. Without it that agent no-ops and answers rely on your documents only. |
| `USE_LOCAL_EMBEDDINGS` | No | `true` uses Sentence Transformers (`BAAI/bge-small-en-v1.5`) instead of OpenAI. Also the automatic fallback when no OpenAI key is set — the first run downloads ~130 MB. |
| `SECRET_KEY` | **Yes in production** | JWT signing key. The default is a well-known dev value. |

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs
Capability check: `curl localhost:8000/health` reports whether the LLM and
external search are actually wired up.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App: http://localhost:5173

> Vite 7 wants Node **20.19+ or 22.12+**. It runs on 22.11 but prints a warning.

### 4. Verify

```bash
cd server
./.venv/bin/python scripts/smoke_test.py    # HTTP: auth, isolation, upload, search, analytics
./.venv/bin/python scripts/verify_rag.py    # in-process: retrieval, citations, MCQ grading (stubbed LLM)
```

`smoke_test.py` needs the server running and skips generation-dependent steps
when no `OPENAI_API_KEY` is set. `verify_rag.py` stubs the LLM, so it exercises
the agent pipeline without spending API credits.

## Features

| Feature | Status |
|---------|--------|
| JWT auth (register, login, profile) | ✅ |
| PDF upload, processing, chunking, embeddings | ✅ |
| Vector search (ChromaDB) | ✅ |
| Agentic chat with retrieval evaluation | ✅ |
| External search fallback (Tavily) | ✅ |
| Summary generator | ✅ |
| MCQ generator | ✅ |
| Mock tests + scoring | ✅ |
| Analytics dashboard | ✅ |
| Personalized recommendations | ✅ |
| User data isolation | ✅ |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Current user |
| PATCH | `/api/auth/profile` | Update name / password |
| GET | `/api/pdf?search=` | List or search own PDFs |
| POST | `/api/pdf/upload` | Upload (returns immediately; processes in background) |
| GET | `/api/pdf/{id}` | Poll `processing_status` |
| PATCH | `/api/pdf/{id}` | Rename |
| DELETE | `/api/pdf/{id}` | Delete (keeps chats/tests, clears the link) |
| POST | `/api/chat` | AI chat |
| GET | `/api/chat/sessions?search=` | List / search past conversations |
| GET | `/api/chat/history/{id}` | Replay a conversation |
| POST | `/api/summary` | Generate summary |
| POST | `/api/mcq` | Generate MCQs (returns `setId`) |
| POST | `/api/mcq/submit` | Grade a set server-side |
| POST | `/api/mocktest` | Generate mock test |
| POST | `/api/mocktest/submit` | Submit test |
| GET | `/api/analytics` | Learning analytics |
| GET | `/api/recommendations` | Study recommendations |

## Environment Variables

`.env` files are git-ignored. Create them locally.

`server/.env` — copy from `server/.env.example`; see the table in Quick Start.

`client/.env`:

```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=AgentLearn
VITE_MAX_UPLOAD_SIZE=20971520
VITE_ALLOWED_FILE_TYPES=application/pdf
```

Vite only exposes `VITE_`-prefixed variables, and they are **bundled into the
client build** — never put a secret in `client/.env`.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, ChromaDB
- **AI:** OpenAI (LLM + embeddings), Sentence Transformers (local fallback), Tavily (search)
- **Security:** JWT, BCrypt password hashing, per-user data scoping

## Development Notes

- PDFs are stored in `server/uploads/{user_id}/`
- Vector embeddings persist in `server/chroma_data/`
- Without `OPENAI_API_KEY`, AI endpoints return **503**; everything else works
- Mock test scores below 60% trigger automatic recommendation generation
- Upload is asynchronous: `POST /api/pdf/upload` returns `processing_status:
  "processing"` and the client polls `GET /api/pdf/{id}`
- Chunks carry the page they came from, so citations point at real pages
- MCQ and mock-test answer keys are never sent to the browser before submission

## Known Gaps

Honest list of what is *not* production-ready yet:

- **No migrations.** Tables are created with `Base.metadata.create_all()` on
  startup, which cannot alter an existing schema. Alembic is in
  `requirements.txt` but no migration set exists — model changes currently need
  a manual schema reset. This is the first thing to fix before any real deploy.
- **No automated test suite.** `scripts/` holds two verification scripts, not
  unit tests. There is no CI.
- **`studyHours` only counts mock-test time**, the one activity that is actually
  timed. Reading and chat time are not instrumented, so it under-reports.
- **Scanned/image-only PDFs are rejected** rather than OCR'd; the document is
  marked `failed` with an explanatory `processing_error`.
- **Background processing is in-process** (FastAPI `BackgroundTasks`). A restart
  mid-processing leaves a document stuck in `processing`. A real queue (Celery,
  RQ, arq) is the next step.
- **No rate limiting** on the generation endpoints, which cost money per call.
- **No Dockerfiles** for the app itself; compose only provides Postgres.

## Future Enhancements

The modular layout supports adding DOCX/OCR uploads, LangGraph multi-agent graphs, Pinecone/Weaviate adapters, spaced repetition, voice interaction, and role-based access without restructuring the core app.

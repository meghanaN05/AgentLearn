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

### 2. Backend

```bash
cd server
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

Edit `server/.env`:

- Set `OPENAI_API_KEY` for AI features (chat, summaries, MCQs)
- Optionally set `TAVILY_API_KEY` for external search fallback
- Set `USE_LOCAL_EMBEDDINGS=true` to use Sentence Transformers instead of OpenAI embeddings

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App: http://localhost:5173

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
| GET/POST | `/api/pdf` | List / upload PDFs |
| POST | `/api/chat` | AI chat |
| POST | `/api/summary` | Generate summary |
| POST | `/api/mcq` | Generate MCQs |
| POST | `/api/mocktest` | Generate mock test |
| POST | `/api/mocktest/submit` | Submit test |
| GET | `/api/analytics` | Learning analytics |
| GET | `/api/recommendations` | Study recommendations |

## Environment Variables

See `server/.env.example` for all backend settings.

Frontend uses `client/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Recharts
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, ChromaDB
- **AI:** OpenAI (LLM + embeddings), Sentence Transformers (local fallback), Tavily (search)
- **Security:** JWT, BCrypt password hashing, per-user data scoping

## Development Notes

- PDFs are stored in `server/uploads/{user_id}/`
- Vector embeddings persist in `server/chroma_data/`
- Without `OPENAI_API_KEY`, the API runs but AI endpoints return a setup message
- Mock test scores below 60% trigger automatic recommendation generation

## Future Enhancements

The modular layout supports adding DOCX/OCR uploads, LangGraph multi-agent graphs, Pinecone/Weaviate adapters, spaced repetition, voice interaction, and role-based access without restructuring the core app.

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import Base, engine
from app.routers import analytics, auth, chat, mcq, mocktest, pdf, summary
from app.services.llm_service import LLMUnavailableError
from app.services.pdf_processor import ensure_upload_dir

settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    ensure_upload_dir()


@app.exception_handler(LLMUnavailableError)
def handle_llm_unavailable(request: Request, exc: LLMUnavailableError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.get("/health")
def health_check():
    """Reports which optional AI capabilities are actually wired up."""
    from app.services.llm_service import llm_service

    return {
        "status": "ok",
        "app": settings.app_name,
        "llm": llm_service.is_available,
        "externalSearch": bool(settings.enable_external_search and settings.tavily_api_key),
    }


app.include_router(auth.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(summary.router, prefix="/api")
app.include_router(mcq.router, prefix="/api")
app.include_router(mocktest.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

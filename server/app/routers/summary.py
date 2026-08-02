from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, Summary, User
from app.schemas.summary import SummaryRequest, SummaryResponse
from app.services.document_service import document_service

router = APIRouter(prefix="/summary", tags=["summary"])

SUMMARY_TYPES = {
    "short": "Provide a concise short summary in 1-2 paragraphs.",
    "medium": "Provide a balanced medium-length summary with key concepts.",
    "detailed": "Provide a detailed summary with sections, examples, and definitions.",
    "bullet": "Provide bullet-point revision notes.",
    "revision": "Provide revision notes optimized for exam preparation.",
    "takeaways": "Provide key takeaways only.",
}


def _generate_summary(db: Session, current_user: User, payload: SummaryRequest) -> SummaryResponse:
    document_service.get_document(db, current_user.id, payload.pdfId)
    instruction = SUMMARY_TYPES.get(payload.summaryType, SUMMARY_TYPES["medium"])
    query = payload.topic or f"Summarize the uploaded document ({payload.summaryType} summary)"

    result = agent_orchestrator.run(
        query=query,
        user_id=current_user.id,
        document_id=payload.pdfId,
        task="summary",
        extra_instructions=instruction,
    )

    summary = Summary(
        user_id=current_user.id,
        document_id=payload.pdfId,
        summary_type=payload.summaryType,
        content=result.answer,
    )
    db.add(summary)
    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="summary_generated",
            event_metadata={"document_id": payload.pdfId, "summary_type": payload.summaryType},
        )
    )
    db.commit()
    db.refresh(summary)

    return SummaryResponse(summary=result.answer, id=summary.id)


@router.post("", response_model=SummaryResponse)
def generate_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _generate_summary(db, current_user, payload)


@router.post("/regenerate", response_model=SummaryResponse)
def regenerate_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _generate_summary(db, current_user, payload)

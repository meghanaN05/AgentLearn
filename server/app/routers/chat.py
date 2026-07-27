from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, ChatMessage, ChatSession, User
from app.schemas.chat import ChatMessageOut, ChatRequest, ChatResponse
from app.services.document_service import document_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session: ChatSession | None = None
    if payload.sessionId:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == payload.sessionId, ChatSession.user_id == current_user.id)
            .first()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        session = ChatSession(
            user_id=current_user.id,
            document_id=payload.pdfId,
            title=payload.message[:80],
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    if payload.pdfId:
        document_service.get_document(db, current_user.id, payload.pdfId)

    history = [
        {"role": message.role, "content": message.content}
        for message in session.messages
    ]

    result = agent_orchestrator.run(
        query=payload.message,
        user_id=current_user.id,
        document_id=payload.pdfId,
        conversation_history=history,
        task="chat",
    )

    user_message = ChatMessage(session_id=session.id, role="user", content=payload.message)
    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=result.answer,
        retrieved_chunks=result.retrieved_chunks,
        external_search_used=result.external_search_used,
        tokens_used=result.tokens_used,
        latency_ms=result.latency_ms,
    )
    db.add_all([user_message, assistant_message])
    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="chat_message",
            event_metadata={"session_id": session.id},
        )
    )
    db.commit()

    return ChatResponse(
        answer=result.answer,
        sources=result.sources,
        sessionId=session.id,
        externalSearchUsed=result.external_search_used,
    )


@router.get("/history/{session_id}", response_model=list[ChatMessageOut])
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    return [
        ChatMessageOut(
            id=message.id,
            role=message.role,
            content=message.content,
            created_at=message.created_at.isoformat(),
        )
        for message in session.messages
    ]


@router.delete("/history/{session_id}", status_code=204)
def delete_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    db.delete(session)
    db.commit()

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, ChatMessage, ChatSession, User
from app.schemas.chat import (
    ChatMessageOut,
    ChatRequest,
    ChatResponse,
    ChatSessionOut,
    ChatSessionRename,
)
from app.services.document_service import document_service

router = APIRouter(prefix="/chat", tags=["chat"])


def _get_owned_session(db: Session, user_id: str, session_id: str) -> ChatSession:
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == user_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session


@router.post("", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate ownership of the referenced document before creating anything.
    if payload.pdfId:
        document_service.get_document(db, current_user.id, payload.pdfId)

    is_new_session = payload.sessionId is None
    if payload.sessionId:
        session = _get_owned_session(db, current_user.id, payload.sessionId)
    else:
        session = ChatSession(
            user_id=current_user.id,
            document_id=payload.pdfId,
            title=payload.message[:80],
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    history = [
        {"role": message.role, "content": message.content}
        for message in session.messages
    ]

    try:
        result = agent_orchestrator.run(
            query=payload.message,
            user_id=current_user.id,
            document_id=payload.pdfId,
            conversation_history=history,
            task="chat",
        )
    except Exception:
        # Don't leave an empty session behind when generation fails.
        if is_new_session:
            db.delete(session)
            db.commit()
        raise

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
    # Adding child rows does not trigger the session's onupdate, so bump it here
    # to keep "recent conversations" ordering honest.
    session.updated_at = datetime.utcnow()
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


@router.get("/sessions", response_model=list[ChatSessionOut])
def list_chat_sessions(
    search: str | None = Query(default=None, description="Match session title or message text"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Sessions the user can reopen and continue, newest first."""
    query = db.query(ChatSession).filter(ChatSession.user_id == current_user.id)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.outerjoin(ChatMessage).filter(
            or_(ChatSession.title.ilike(pattern), ChatMessage.content.ilike(pattern))
        ).distinct()

    sessions = query.order_by(ChatSession.updated_at.desc()).all()

    return [_serialize_session(session) for session in sessions]


def _serialize_session(session: ChatSession) -> ChatSessionOut:
    return ChatSessionOut(
        id=session.id,
        title=session.title,
        documentId=session.document_id,
        messageCount=len(session.messages),
        lastMessage=session.messages[-1].content[:200] if session.messages else None,
        createdAt=session.created_at.isoformat(),
        updatedAt=session.updated_at.isoformat(),
    )


@router.patch("/sessions/{session_id}", response_model=ChatSessionOut)
def rename_chat_session(
    session_id: str,
    payload: ChatSessionRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, current_user.id, session_id)
    session.title = payload.title.strip()
    db.commit()
    db.refresh(session)
    return _serialize_session(session)


@router.get("/history/{session_id}", response_model=list[ChatMessageOut])
def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = _get_owned_session(db, current_user.id, session_id)

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
    session = _get_owned_session(db, current_user.id, session_id)
    db.delete(session)
    db.commit()

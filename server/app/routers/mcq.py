import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, MCQSet, User
from app.schemas.mcq import (
    GenerateMCQRequest,
    MCQItem,
    MCQResponse,
    SubmitMCQRequest,
    SubmitMCQResponse,
)
from app.services.document_service import document_service
from app.services.llm_service import llm_service

router = APIRouter(prefix="/mcq", tags=["mcq"])


def _normalize_questions(raw_questions: list) -> list[MCQItem]:
    normalized: list[MCQItem] = []
    for item in raw_questions:
        normalized.append(
            MCQItem(
                id=item.get("id") or str(uuid.uuid4()),
                question=item["question"],
                options=item["options"],
                correctAnswer=item.get("correctAnswer"),
                explanation=item.get("explanation"),
            )
        )
    return normalized


@router.post("", response_model=MCQResponse)
def generate_mcqs(
    payload: GenerateMCQRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document_service.get_document(db, current_user.id, payload.pdfId)
    topic = payload.topic or "the uploaded document"
    instructions = (
        "Return JSON with key 'questions' as an array. Each item must include: "
        "id, question, options (4 strings), correctAnswer (0-3 index), explanation. "
        f"Generate {payload.numberOfQuestions} {payload.difficulty} MCQs on {topic}. "
        "Avoid duplicate questions."
    )

    result = agent_orchestrator.run(
        query=f"Generate MCQs on {topic}",
        user_id=current_user.id,
        document_id=payload.pdfId,
        task="structured",
        extra_instructions=instructions,
    )

    try:
        parsed = llm_service.parse_json(result.answer)
        questions = _normalize_questions(parsed.get("questions", []))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to parse MCQ response: {exc}") from exc

    if not questions:
        raise HTTPException(status_code=500, detail="No MCQs were generated")

    mcq_set = MCQSet(
        user_id=current_user.id,
        document_id=payload.pdfId,
        difficulty=payload.difficulty,
        questions=[question.model_dump() for question in questions],
    )
    db.add(mcq_set)
    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="mcq_generated",
            event_metadata={"document_id": payload.pdfId, "count": len(questions)},
        )
    )
    db.commit()

    public_questions = [
        MCQItem(
            id=question.id,
            question=question.question,
            options=question.options,
        )
        for question in questions
    ]
    return MCQResponse(questions=public_questions)


@router.post("/submit", response_model=SubmitMCQResponse)
def submit_mcqs(
    payload: SubmitMCQRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mcq_set = (
        db.query(MCQSet)
        .filter(MCQSet.document_id == payload.pdfId, MCQSet.user_id == current_user.id)
        .order_by(MCQSet.created_at.desc())
        .first()
    )
    if not mcq_set:
        raise HTTPException(status_code=404, detail="MCQ set not found")

    question_map = {item["id"]: item for item in mcq_set.questions}
    correct = 0
    wrong = 0

    for answer in payload.answers:
        question = question_map.get(answer["questionId"])
        if not question:
            continue
        if answer["selectedOption"] == question.get("correctAnswer"):
            correct += 1
        else:
            wrong += 1

    total = len(payload.answers)
    score = round((correct / total) * 100, 2) if total else 0.0

    return SubmitMCQResponse(
        score=score,
        total=total,
        correctAnswers=correct,
        wrongAnswers=wrong,
    )

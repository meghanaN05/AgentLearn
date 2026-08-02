from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, MCQSet, User
from app.schemas.mcq import (
    GenerateMCQRequest,
    MCQGradedItem,
    MCQItem,
    MCQResponse,
    SubmitMCQRequest,
    SubmitMCQResponse,
)
from app.services.document_service import document_service
from app.services.llm_service import llm_service
from app.services.question_parser import normalize_questions

router = APIRouter(prefix="/mcq", tags=["mcq"])


def _normalize_questions(raw_questions: list) -> list[MCQItem]:
    return [
        MCQItem(
            id=item["id"],
            question=item["question"],
            options=item["options"],
            correctAnswer=item["correctAnswer"],
            explanation=item["explanation"],
        )
        for item in normalize_questions(raw_questions)
    ]


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
    db.refresh(mcq_set)

    # correctAnswer and explanation are withheld until the set is submitted.
    public_questions = [
        MCQItem(id=question.id, question=question.question, options=question.options)
        for question in questions
    ]
    return MCQResponse(setId=mcq_set.id, questions=public_questions)


@router.post("/submit", response_model=SubmitMCQResponse)
def submit_mcqs(
    payload: SubmitMCQRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(MCQSet).filter(MCQSet.user_id == current_user.id)
    if payload.setId:
        query = query.filter(MCQSet.id == payload.setId)
    elif payload.pdfId:
        query = query.filter(MCQSet.document_id == payload.pdfId)
    else:
        raise HTTPException(status_code=400, detail="Provide either setId or pdfId")

    mcq_set = query.order_by(MCQSet.created_at.desc()).first()
    if not mcq_set:
        raise HTTPException(status_code=404, detail="MCQ set not found")

    selected_by_question = {answer.questionId: answer.selectedOption for answer in payload.answers}
    correct = 0
    wrong = 0
    unanswered = 0
    results = []

    # Iterate the stored set, not the submission, so skipped questions still
    # count against the score instead of quietly shrinking the denominator.
    for question in mcq_set.questions:
        selected = selected_by_question.get(question["id"])
        expected = question.get("correctAnswer")
        is_correct = selected is not None and selected == expected

        if selected is None:
            unanswered += 1
        elif is_correct:
            correct += 1
        else:
            wrong += 1

        results.append(
            MCQGradedItem(
                questionId=question["id"],
                question=question["question"],
                selectedOption=selected,
                correctAnswer=expected,
                isCorrect=is_correct,
                explanation=question.get("explanation"),
            )
        )

    total = len(mcq_set.questions)
    score = round((correct / total) * 100, 2) if total else 0.0

    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="mcq_submitted",
            event_metadata={"set_id": mcq_set.id, "score": score},
        )
    )
    db.commit()

    return SubmitMCQResponse(
        score=score,
        total=total,
        correctAnswers=correct,
        wrongAnswers=wrong,
        unanswered=unanswered,
        results=results,
    )

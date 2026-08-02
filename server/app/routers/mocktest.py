from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import AnalyticsEvent, MockTest, MockTestAttempt, User
from app.schemas.mocktest import (
    GenerateMockTestRequest,
    MockQuestion,
    MockTestAttemptOut,
    MockTestResponse,
    SubmitMockTestRequest,
    SubmitMockTestResponse,
)
from app.services.document_service import document_service
from app.services.llm_service import llm_service
from app.services.question_parser import normalize_questions

router = APIRouter(prefix="/mocktest", tags=["mocktest"])


@router.post("", response_model=MockTestResponse)
def generate_mock_test(
    payload: GenerateMockTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document_service.get_document(db, current_user.id, payload.pdfId)
    topic = payload.topic or "the uploaded document"
    instructions = (
        "Return JSON with key 'questions' as an array. Each item must include: "
        "id, question, options (4 strings), correctAnswer (0-3 index), topic. "
        f"Generate {payload.numberOfQuestions} {payload.difficulty} exam-style MCQs on {topic}."
    )

    result = agent_orchestrator.run(
        query=f"Generate mock test on {topic}",
        user_id=current_user.id,
        document_id=payload.pdfId,
        task="structured",
        extra_instructions=instructions,
    )

    try:
        parsed = llm_service.parse_json(result.answer)
        # Same validation as the MCQ route: malformed or duplicate questions
        # would otherwise be stored and skew topic accuracy after grading.
        raw_questions = normalize_questions(parsed.get("questions", []))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to parse mock test: {exc}") from exc

    if not raw_questions:
        raise HTTPException(status_code=500, detail="No mock test questions generated")

    mock_test = MockTest(
        user_id=current_user.id,
        document_id=payload.pdfId,
        difficulty=payload.difficulty,
        time_limit_minutes=payload.timeLimitMinutes,
        questions=raw_questions,
    )
    db.add(mock_test)
    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="mocktest_generated",
            event_metadata={"document_id": payload.pdfId, "count": len(raw_questions)},
        )
    )
    db.commit()
    db.refresh(mock_test)

    public_questions = [
        MockQuestion(
            id=item["id"],
            question=item["question"],
            options=item["options"],
        )
        for item in raw_questions
    ]
    return MockTestResponse(testId=mock_test.id, questions=public_questions)


@router.get("/attempts", response_model=list[MockTestAttemptOut])
def list_attempts(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mock test history, newest first. Declared before /{test_id} so the
    literal path is not swallowed by the parameterised route."""
    attempts = (
        db.query(MockTestAttempt)
        .filter(MockTestAttempt.user_id == current_user.id)
        .order_by(MockTestAttempt.submitted_at.desc())
        .limit(max(1, min(limit, 100)))
        .all()
    )

    return [
        MockTestAttemptOut(
            id=attempt.id,
            testId=attempt.mock_test_id,
            score=attempt.score,
            totalQuestions=attempt.total_questions,
            correctAnswers=attempt.correct_answers,
            wrongAnswers=attempt.wrong_answers,
            accuracy=attempt.accuracy,
            timeTakenSeconds=attempt.time_taken_seconds,
            weakTopics=attempt.weak_topics or [],
            strongTopics=attempt.strong_topics or [],
            submittedAt=attempt.submitted_at.isoformat(),
        )
        for attempt in attempts
    ]


@router.get("/{test_id}", response_model=MockTestResponse)
def get_mock_test(
    test_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mock_test = (
        db.query(MockTest)
        .filter(MockTest.id == test_id, MockTest.user_id == current_user.id)
        .first()
    )
    if not mock_test:
        raise HTTPException(status_code=404, detail="Mock test not found")

    questions = [
        MockQuestion(
            id=item["id"],
            question=item["question"],
            options=item["options"],
        )
        for item in mock_test.questions
    ]
    return MockTestResponse(testId=mock_test.id, questions=questions)


@router.post("/submit", response_model=SubmitMockTestResponse)
def submit_mock_test(
    payload: SubmitMockTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mock_test = (
        db.query(MockTest)
        .filter(MockTest.id == payload.testId, MockTest.user_id == current_user.id)
        .first()
    )
    if not mock_test:
        raise HTTPException(status_code=404, detail="Mock test not found")

    question_map = {item["id"]: item for item in mock_test.questions}
    correct = 0
    wrong = 0
    weak_topics: dict[str, int] = {}
    strong_topics: dict[str, int] = {}

    for answer in payload.answers:
        question = question_map.get(answer["questionId"])
        if not question:
            continue
        topic = question.get("topic") or "General"
        if answer["selectedOption"] == question.get("correctAnswer"):
            correct += 1
            strong_topics[topic] = strong_topics.get(topic, 0) + 1
        else:
            wrong += 1
            weak_topics[topic] = weak_topics.get(topic, 0) + 1

    total = len(mock_test.questions)
    accuracy = round((correct / total) * 100, 2) if total else 0.0

    attempt = MockTestAttempt(
        mock_test_id=mock_test.id,
        user_id=current_user.id,
        answers=payload.answers,
        score=accuracy,
        total_questions=total,
        correct_answers=correct,
        wrong_answers=wrong,
        accuracy=accuracy,
        time_taken_seconds=payload.timeTakenSeconds,
        weak_topics=sorted(weak_topics, key=weak_topics.get, reverse=True)[:5],
        strong_topics=sorted(strong_topics, key=strong_topics.get, reverse=True)[:5],
    )
    mock_test.status = "completed"
    db.add(attempt)
    db.add(
        AnalyticsEvent(
            user_id=current_user.id,
            event_type="mocktest_submitted",
            event_metadata={"test_id": mock_test.id, "score": accuracy},
        )
    )
    db.commit()

    if accuracy < 60:
        _maybe_generate_recommendations(db, current_user, attempt.weak_topics or [])

    return SubmitMockTestResponse(
        score=accuracy,
        totalQuestions=total,
        correctAnswers=correct,
        wrongAnswers=wrong,
        accuracy=accuracy,
        weakTopics=attempt.weak_topics or [],
        strongTopics=attempt.strong_topics or [],
    )


def _maybe_generate_recommendations(db: Session, user: User, weak_topics: list[str]) -> None:
    from app.models import Recommendation

    if not weak_topics:
        return

    result = agent_orchestrator.run(
        query=f"Create a study plan for weak topics: {', '.join(weak_topics)}",
        user_id=user.id,
        task="recommendation",
        extra_instructions=(
            "Return JSON with keys recommendations (array of title, description, priority, topic) "
            "and studyPlan (array of topic, duration, completed=false)."
        ),
    )
    try:
        parsed = llm_service.parse_json(result.answer)
    except Exception:
        return

    for item in parsed.get("recommendations", [])[:5]:
        db.add(
            Recommendation(
                user_id=user.id,
                title=item.get("title", "Study recommendation"),
                description=item.get("description", ""),
                priority=item.get("priority", "Medium"),
                topic=item.get("topic", "General"),
                study_plan=parsed.get("studyPlan", []),
            )
        )
    db.commit()

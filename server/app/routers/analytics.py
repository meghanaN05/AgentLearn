from collections import defaultdict
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.agents.orchestrator import agent_orchestrator
from app.core.security import get_current_user
from app.database import get_db
from app.models import (
    AnalyticsEvent,
    ChatMessage,
    ChatSession,
    Document,
    MCQSet,
    MockTest,
    MockTestAttempt,
    Recommendation,
    Summary,
    User,
)
from app.schemas.analytics import RecommendationItem, RecommendationResponse, StudyPlanTask
from app.services.llm_service import llm_service

router = APIRouter(tags=["analytics"])


def _learning_streak(event_days: set[date]) -> int:
    """Consecutive days of activity ending today (or yesterday, mid-streak)."""
    if not event_days:
        return 0

    today = datetime.utcnow().date()
    cursor = today if today in event_days else today - timedelta(days=1)
    if cursor not in event_days:
        return 0

    streak = 0
    while cursor in event_days:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _topic_accuracy(db: Session, user_id: str) -> list[dict]:
    """Real per-topic accuracy, computed from stored answers against stored keys."""
    rows = (
        db.query(MockTestAttempt, MockTest)
        .join(MockTest, MockTestAttempt.mock_test_id == MockTest.id)
        .filter(MockTestAttempt.user_id == user_id)
        .order_by(MockTestAttempt.submitted_at.desc())
        .limit(50)
        .all()
    )

    tally: dict[str, list[int]] = defaultdict(list)
    for attempt, mock_test in rows:
        questions = {item["id"]: item for item in mock_test.questions}
        selected = {
            answer.get("questionId"): answer.get("selectedOption")
            for answer in (attempt.answers or [])
            if isinstance(answer, dict)
        }
        for question_id, question in questions.items():
            topic = question.get("topic") or "General"
            tally[topic].append(1 if selected.get(question_id) == question.get("correctAnswer") else 0)

    return sorted(
        (
            {
                "topic": topic,
                "score": round(sum(marks) / len(marks) * 100, 1),
                "attempted": len(marks),
            }
            for topic, marks in tally.items()
            if marks
        ),
        key=lambda item: item["score"],
    )


@router.get("/analytics", response_model=dict)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_pdfs = db.query(Document).filter(Document.user_id == current_user.id).count()
    total_chats = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).count()
    total_tests = (
        db.query(MockTestAttempt).filter(MockTestAttempt.user_id == current_user.id).count()
    )

    avg_score = (
        db.query(func.avg(MockTestAttempt.score))
        .filter(MockTestAttempt.user_id == current_user.id)
        .scalar()
        or 0.0
    )

    questions_asked = (
        db.query(ChatMessage)
        .join(ChatSession, ChatMessage.session_id == ChatSession.id)
        .filter(ChatSession.user_id == current_user.id, ChatMessage.role == "user")
        .count()
    )
    summaries_generated = (
        db.query(Summary).filter(Summary.user_id == current_user.id).count()
    )
    mcq_sets = db.query(MCQSet).filter(MCQSet.user_id == current_user.id).all()
    mcqs_generated = sum(len(mcq_set.questions or []) for mcq_set in mcq_sets)

    # Only time we actually measured: mock tests are the one timed activity.
    measured_seconds = (
        db.query(func.sum(MockTestAttempt.time_taken_seconds))
        .filter(MockTestAttempt.user_id == current_user.id)
        .scalar()
        or 0
    )
    study_hours = round(measured_seconds / 3600, 2)

    event_days = {
        created_at.date()
        for (created_at,) in db.query(AnalyticsEvent.created_at)
        .filter(AnalyticsEvent.user_id == current_user.id)
        .all()
    }

    attempts = (
        db.query(MockTestAttempt)
        .filter(MockTestAttempt.user_id == current_user.id)
        .order_by(MockTestAttempt.submitted_at.desc())
        .limit(50)
        .all()
    )

    topic_performance = _topic_accuracy(db, current_user.id)
    weak_topics = [item["topic"] for item in topic_performance if item["score"] < 60][:5]
    strong_topics = [item["topic"] for item in reversed(topic_performance) if item["score"] >= 75][:5]

    weekly_progress = []
    for week_offset in range(4, -1, -1):
        start = datetime.utcnow() - timedelta(days=(week_offset + 1) * 7)
        end = datetime.utcnow() - timedelta(days=week_offset * 7)
        week_attempts = [
            attempt
            for attempt in attempts
            if start <= attempt.submitted_at <= end
        ]
        score = (
            round(sum(item.score for item in week_attempts) / len(week_attempts), 1)
            if week_attempts
            else 0.0
        )
        weekly_progress.append({"week": f"Week {5 - week_offset}", "score": score})

    return {
        "totalPDFs": total_pdfs,
        "totalChats": total_chats,
        "totalTests": total_tests,
        "questionsAsked": questions_asked,
        "summariesGenerated": summaries_generated,
        "mcqsGenerated": mcqs_generated,
        "averageScore": round(float(avg_score), 1),
        # Measured mock-test time only; chat and reading time are not instrumented.
        "studyHours": study_hours,
        "activeDays": len(event_days),
        "learningStreak": _learning_streak(event_days),
        "topicPerformance": topic_performance[:8],
        "weakTopics": weak_topics,
        "strongTopics": strong_topics,
        "weeklyProgress": weekly_progress,
    }


@router.get("/analytics/topics")
def get_topic_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = get_analytics(db=db, current_user=current_user)
    return analytics["topicPerformance"]


@router.get("/analytics/weekly")
def get_weekly_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    analytics = get_analytics(db=db, current_user=current_user)
    return analytics["weeklyProgress"]


@router.get("/recommendations", response_model=RecommendationResponse)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(10)
        .all()
    )

    recommendations = [
        RecommendationItem(
            id=record.id,
            title=record.title,
            description=record.description,
            priority=record.priority,
            topic=record.topic,
        )
        for record in records
    ]

    study_plan: list[StudyPlanTask] = []
    if records and records[0].study_plan:
        for index, task in enumerate(records[0].study_plan):
            study_plan.append(
                StudyPlanTask(
                    id=str(index + 1),
                    topic=task.get("topic", "General"),
                    duration=task.get("duration", "30 min"),
                    completed=bool(task.get("completed", False)),
                )
            )

    return RecommendationResponse(recommendations=recommendations, studyPlan=study_plan)


@router.post("/recommendations/refresh", response_model=RecommendationResponse)
def refresh_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    latest_attempt = (
        db.query(MockTestAttempt)
        .filter(MockTestAttempt.user_id == current_user.id)
        .order_by(MockTestAttempt.submitted_at.desc())
        .first()
    )
    weak_topics = latest_attempt.weak_topics if latest_attempt else ["General revision"]

    result = agent_orchestrator.run(
        query=f"Create personalized recommendations for topics: {', '.join(weak_topics)}",
        user_id=current_user.id,
        task="recommendation",
        extra_instructions=(
            "Return JSON with recommendations (title, description, priority, topic) "
            "and studyPlan (topic, duration, completed)."
        ),
    )

    try:
        parsed = llm_service.parse_json(result.answer)
    except Exception:
        parsed = {"recommendations": [], "studyPlan": []}

    db.query(Recommendation).filter(Recommendation.user_id == current_user.id).delete()
    for item in parsed.get("recommendations", [])[:5]:
        db.add(
            Recommendation(
                user_id=current_user.id,
                title=item.get("title", "Study recommendation"),
                description=item.get("description", ""),
                priority=item.get("priority", "Medium"),
                topic=item.get("topic", "General"),
                study_plan=parsed.get("studyPlan", []),
            )
        )
    db.commit()

    return get_recommendations(db=db, current_user=current_user)

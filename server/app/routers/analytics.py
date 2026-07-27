from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models import (
    AnalyticsEvent,
    ChatSession,
    Document,
    MockTestAttempt,
    User,
)
from app.schemas.analytics import RecommendationItem, RecommendationResponse, StudyPlanTask
from app.models import Recommendation
from app.agents.orchestrator import agent_orchestrator
from app.services.llm_service import llm_service

router = APIRouter(tags=["analytics"])


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

    study_events = (
        db.query(AnalyticsEvent)
        .filter(AnalyticsEvent.user_id == current_user.id)
        .count()
    )
    study_hours = round(study_events * 0.25, 1)

    attempts = (
        db.query(MockTestAttempt)
        .filter(MockTestAttempt.user_id == current_user.id)
        .order_by(MockTestAttempt.submitted_at.desc())
        .limit(20)
        .all()
    )

    topic_scores: dict[str, list[float]] = defaultdict(list)
    for attempt in attempts:
        for topic in attempt.weak_topics or []:
            topic_scores[topic].append(max(0.0, attempt.score - 10))
        for topic in attempt.strong_topics or []:
            topic_scores[topic].append(min(100.0, attempt.score + 5))

    topic_performance = [
        {"topic": topic, "score": round(sum(scores) / len(scores), 1)}
        for topic, scores in topic_scores.items()
    ][:8]

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
        "averageScore": round(float(avg_score), 1),
        "studyHours": study_hours,
        "topicPerformance": topic_performance,
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

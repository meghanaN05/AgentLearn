from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    totalPDFs: int
    totalChats: int
    totalTests: int
    averageScore: float
    studyHours: float
    topicPerformance: list[dict]
    weeklyProgress: list[dict]


class RecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    topic: str


class StudyPlanTask(BaseModel):
    id: str
    topic: str
    duration: str
    completed: bool


class RecommendationResponse(BaseModel):
    recommendations: list[RecommendationItem]
    studyPlan: list[StudyPlanTask]

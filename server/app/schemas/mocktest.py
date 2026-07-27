from pydantic import BaseModel, Field


class GenerateMockTestRequest(BaseModel):
    pdfId: str
    difficulty: str = "medium"
    numberOfQuestions: int = Field(default=10, ge=1, le=50)
    topic: str | None = None
    timeLimitMinutes: int | None = None


class MockQuestion(BaseModel):
    id: str
    question: str
    options: list[str]


class MockTestResponse(BaseModel):
    testId: str
    questions: list[MockQuestion]


class SubmitMockTestRequest(BaseModel):
    testId: str
    answers: list[dict]
    timeTakenSeconds: int = 0


class SubmitMockTestResponse(BaseModel):
    score: float
    totalQuestions: int
    correctAnswers: int
    wrongAnswers: int
    accuracy: float
    weakTopics: list[str] = []
    strongTopics: list[str] = []

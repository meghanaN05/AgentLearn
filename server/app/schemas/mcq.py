from pydantic import BaseModel, Field


class GenerateMCQRequest(BaseModel):
    pdfId: str
    difficulty: str = "medium"
    numberOfQuestions: int = Field(default=5, ge=1, le=50)
    topic: str | None = None


class MCQItem(BaseModel):
    id: str
    question: str
    options: list[str]
    correctAnswer: int | None = None
    explanation: str | None = None


class MCQResponse(BaseModel):
    questions: list[MCQItem]


class SubmitMCQRequest(BaseModel):
    pdfId: str
    answers: list[dict]


class SubmitMCQResponse(BaseModel):
    score: float
    total: int
    correctAnswers: int
    wrongAnswers: int

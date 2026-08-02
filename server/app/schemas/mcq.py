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
    setId: str
    questions: list[MCQItem]


class MCQAnswer(BaseModel):
    questionId: str
    selectedOption: int


class SubmitMCQRequest(BaseModel):
    # setId pins grading to the exact set that was served. pdfId alone is
    # ambiguous once a user has generated more than one set for a document.
    setId: str | None = None
    pdfId: str | None = None
    answers: list[MCQAnswer]


class MCQGradedItem(BaseModel):
    questionId: str
    question: str
    selectedOption: int | None
    correctAnswer: int
    isCorrect: bool
    explanation: str | None = None


class SubmitMCQResponse(BaseModel):
    score: float
    total: int
    correctAnswers: int
    wrongAnswers: int
    unanswered: int
    results: list[MCQGradedItem]

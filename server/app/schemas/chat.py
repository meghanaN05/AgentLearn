from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    pdfId: str | None = None
    sessionId: str | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    sessionId: str
    externalSearchUsed: bool = False


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

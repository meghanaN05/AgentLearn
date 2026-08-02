from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints


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


class ChatSessionRename(BaseModel):
    # strip_whitespace runs before min_length, so a whitespace-only title is
    # rejected rather than saved as an empty string.
    title: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=512)
    ]


class ChatSessionOut(BaseModel):
    id: str
    title: str
    documentId: str | None = None
    messageCount: int
    lastMessage: str | None = None
    createdAt: str
    updatedAt: str

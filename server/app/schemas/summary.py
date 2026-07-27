from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    pdfId: str
    summaryType: str = "medium"
    topic: str | None = None


class SummaryResponse(BaseModel):
    summary: str
    id: str | None = None

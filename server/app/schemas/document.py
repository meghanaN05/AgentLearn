from datetime import datetime

from pydantic import BaseModel, Field


class DocumentOut(BaseModel):
    id: str
    filename: str
    pages: int
    size: int
    uploaded_at: datetime
    processing_status: str = "completed"
    processing_error: str | None = None

    model_config = {"from_attributes": True}


class DocumentRename(BaseModel):
    filename: str = Field(min_length=1, max_length=512)

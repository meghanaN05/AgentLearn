from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, StringConstraints


class DocumentOut(BaseModel):
    id: str
    filename: str
    pages: int
    size: int
    uploaded_at: datetime
    processing_status: str = "completed"
    processing_error: str | None = None
    embedding_model: str | None = None
    # True when the document was indexed with a different embedding model than
    # the one now configured; it will not be retrievable until re-indexed.
    needs_reindex: bool = False

    model_config = {"from_attributes": True}


class DocumentRename(BaseModel):
    # strip_whitespace runs before min_length, so " " cannot become an empty name.
    filename: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=512)
    ]

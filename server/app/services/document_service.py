from __future__ import annotations

import logging
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.models import (
    AnalyticsEvent,
    ChatSession,
    Document,
    DocumentChunk,
    MCQSet,
    MockTest,
)
from app.services.embedding_service import get_embedding_service
from app.services.pdf_processor import chunk_pages, ensure_upload_dir, extract_pages
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)
settings = get_settings()


class DocumentService:
    def list_documents(self, db: Session, user_id: str) -> list[Document]:
        return (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    def get_document(self, db: Session, user_id: str, document_id: str) -> Document:
        document = (
            db.query(Document)
            .filter(Document.id == document_id, Document.user_id == user_id)
            .first()
        )
        if not document:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        return document

    def search_documents(self, db: Session, user_id: str, query: str) -> list[Document]:
        pattern = f"%{query.strip()}%"
        return (
            db.query(Document)
            .filter(Document.user_id == user_id, Document.filename.ilike(pattern))
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    async def upload_document(
        self, db: Session, user_id: str, file: UploadFile
    ) -> Document:
        if file.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        content = await file.read()
        if len(content) > settings.max_upload_size_bytes:
            raise HTTPException(status_code=400, detail="File exceeds maximum upload size")
        if not content.startswith(b"%PDF"):
            raise HTTPException(status_code=400, detail="File is not a valid PDF")

        upload_dir = ensure_upload_dir() / user_id
        upload_dir.mkdir(parents=True, exist_ok=True)

        document_id = str(uuid.uuid4())
        safe_name = Path(file.filename or "document.pdf").name
        file_path = upload_dir / f"{document_id}_{safe_name}"

        with open(file_path, "wb") as output:
            output.write(content)

        document = Document(
            id=document_id,
            user_id=user_id,
            filename=safe_name,
            original_filename=safe_name,
            file_path=str(file_path),
            file_size=len(content),
            processing_status="processing",
        )
        db.add(document)
        db.add(
            AnalyticsEvent(
                user_id=user_id,
                event_type="pdf_uploaded",
                event_metadata={"document_id": document.id, "filename": safe_name},
            )
        )
        db.commit()
        db.refresh(document)
        # Extraction + embedding runs in the background; the client polls
        # processing_status rather than holding the upload request open.
        return document

    def process_document_in_background(self, document_id: str) -> None:
        """Entry point for BackgroundTasks — owns its own session and never raises."""
        db = SessionLocal()
        try:
            document = db.query(Document).filter(Document.id == document_id).first()
            if document is None:
                return
            try:
                self._process_document(db, document)
                document.processing_status = "completed"
            except Exception as exc:  # noqa: BLE001 - status must reflect any failure
                logger.exception("PDF processing failed for document %s", document_id)
                document.processing_status = "failed"
                document.processing_error = str(exc)[:1000]
            db.commit()
        finally:
            db.close()

    def rename_document(
        self, db: Session, user_id: str, document_id: str, filename: str
    ) -> Document:
        document = self.get_document(db, user_id, document_id)
        document.filename = filename
        db.commit()
        db.refresh(document)
        return document

    def delete_document(self, db: Session, user_id: str, document_id: str) -> None:
        document = self.get_document(db, user_id, document_id)

        vector_store.delete_document_chunks(document.id, user_id)
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()

        # Detach history that outlives the source PDF. Chats, MCQ sets and test
        # results stay in analytics; only the document link is cleared. Summaries
        # and chunks cascade away with the document itself.
        for model in (ChatSession, MCQSet, MockTest):
            db.query(model).filter(model.document_id == document.id).update(
                {"document_id": None}, synchronize_session=False
            )

        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()

        db.delete(document)
        db.commit()

    def reindex_document(self, db: Session, user_id: str, document_id: str) -> Document:
        """Rebuild a document's vectors with the currently configured model."""
        document = self.get_document(db, user_id, document_id)
        document.processing_status = "processing"
        document.processing_error = None
        db.commit()
        return document

    def _process_document(self, db: Session, document: Document) -> None:
        # Drop any vectors from a previous run or a previous embedding model.
        vector_store.delete_document_chunks(document.id, document.user_id)
        db.query(DocumentChunk).filter(DocumentChunk.document_id == document.id).delete()

        pages = extract_pages(document.file_path)
        document.total_pages = len(pages)

        chunks = chunk_pages(pages)
        if not chunks:
            # A PDF of scanned images extracts no text; flag it instead of
            # silently registering a document that can never be retrieved.
            raise ValueError(
                "No extractable text found. Scanned or image-only PDFs need OCR."
            )

        chunk_records: list[DocumentChunk] = []
        vector_payload: list[dict] = []

        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            chunk_records.append(
                DocumentChunk(
                    id=chunk_id,
                    document_id=document.id,
                    user_id=document.user_id,
                    chunk_index=chunk["chunk_index"],
                    page_number=chunk["page_number"],
                    content=chunk["content"],
                    vector_id=chunk_id,
                )
            )
            vector_payload.append({"id": chunk_id, **chunk})

        embedding_service = get_embedding_service()
        # Batched so a large book does not become one oversized embedding request.
        embeddings: list[list[float]] = []
        batch_size = 64
        for start in range(0, len(vector_payload), batch_size):
            batch = vector_payload[start : start + batch_size]
            embeddings.extend(embedding_service.embed_texts([item["content"] for item in batch]))

        vector_store.upsert_chunks(
            user_id=document.user_id,
            document_id=document.id,
            chunks=vector_payload,
            embeddings=embeddings,
            model_id=embedding_service.model_id,
        )

        document.embedding_model = embedding_service.model_id
        db.add_all(chunk_records)
        db.commit()


document_service = DocumentService()

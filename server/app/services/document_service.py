from __future__ import annotations

import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import AnalyticsEvent, Document, DocumentChunk
from app.services.embedding_service import get_embedding_service
from app.services.pdf_processor import (
    chunk_text,
    clean_text,
    ensure_upload_dir,
    estimate_page_for_chunk,
    extract_text_from_pdf,
)
from app.services.vector_store import vector_store

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

    async def upload_document(
        self, db: Session, user_id: str, file: UploadFile
    ) -> Document:
        if file.content_type not in ("application/pdf", "application/octet-stream"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        content = await file.read()
        if len(content) > settings.max_upload_size_bytes:
            raise HTTPException(status_code=400, detail="File exceeds maximum upload size")

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
        db.commit()
        db.refresh(document)

        try:
            self._process_document(db, document)
            document.processing_status = "completed"
        except Exception as exc:
            document.processing_status = "failed"
            db.commit()
            raise HTTPException(status_code=500, detail=f"PDF processing failed: {exc}") from exc

        db.add(
            AnalyticsEvent(
                user_id=user_id,
                event_type="pdf_uploaded",
                event_metadata={"document_id": document.id, "filename": document.filename},
            )
        )
        db.commit()
        db.refresh(document)
        return document

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
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()
        db.delete(document)
        db.commit()

    def _process_document(self, db: Session, document: Document) -> None:
        raw_text, total_pages = extract_text_from_pdf(document.file_path)
        cleaned = clean_text(raw_text)
        chunks = chunk_text(cleaned)
        document.total_pages = total_pages

        if not chunks:
            db.commit()
            return

        embedding_service = get_embedding_service()
        chunk_records: list[DocumentChunk] = []
        vector_payload: list[dict] = []

        for index, chunk in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            page_number = estimate_page_for_chunk(raw_text, chunk, total_pages)
            record = DocumentChunk(
                id=chunk_id,
                document_id=document.id,
                user_id=document.user_id,
                chunk_index=index,
                page_number=page_number,
                content=chunk,
                vector_id=chunk_id,
            )
            chunk_records.append(record)
            vector_payload.append(
                {
                    "id": chunk_id,
                    "content": chunk,
                    "page_number": page_number,
                    "chunk_index": index,
                }
            )

        embeddings = embedding_service.embed_texts([item["content"] for item in vector_payload])
        vector_store.upsert_chunks(
            user_id=document.user_id,
            document_id=document.id,
            chunks=vector_payload,
            embeddings=embeddings,
        )

        db.add_all(chunk_records)
        db.commit()


document_service = DocumentService()

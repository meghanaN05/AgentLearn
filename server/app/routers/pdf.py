from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.document import DocumentOut, DocumentRename
from app.services.document_service import document_service

router = APIRouter(prefix="/pdf", tags=["pdf"])


def _serialize_document(document) -> DocumentOut:
    return DocumentOut(
        id=document.id,
        filename=document.filename,
        pages=document.total_pages,
        size=document.file_size,
        uploaded_at=document.uploaded_at,
        processing_status=document.processing_status,
        processing_error=document.processing_error,
    )


@router.get("", response_model=list[DocumentOut])
def list_pdfs(
    search: str | None = Query(default=None, description="Filter by filename"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if search:
        documents = document_service.search_documents(db, current_user.id, search)
    else:
        documents = document_service.list_documents(db, current_user.id)
    return [_serialize_document(doc) for doc in documents]


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = await document_service.upload_document(db, current_user.id, file)
    background_tasks.add_task(
        document_service.process_document_in_background, document.id
    )
    return _serialize_document(document)


@router.get("/{document_id}", response_model=DocumentOut)
def get_pdf(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = document_service.get_document(db, current_user.id, document_id)
    return _serialize_document(document)


@router.patch("/{document_id}", response_model=DocumentOut)
def rename_pdf(
    document_id: str,
    payload: DocumentRename,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = document_service.rename_document(
        db, current_user.id, document_id, payload.filename
    )
    return _serialize_document(document)


@router.delete("/{document_id}", status_code=204)
def delete_pdf(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document_service.delete_document(db, current_user.id, document_id)


@router.get("/{document_id}/download")
def download_pdf(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = document_service.get_document(db, current_user.id, document_id)
    file_path = Path(document.file_path)
    return FileResponse(
        path=file_path,
        filename=document.filename,
        media_type="application/pdf",
    )

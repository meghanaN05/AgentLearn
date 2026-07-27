import os
import re
from pathlib import Path

from pypdf import PdfReader

from app.config import get_settings

settings = get_settings()


def ensure_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
    reader = PdfReader(file_path)
    pages_text: list[str] = []

    for page in reader.pages:
        text = page.extract_text() or ""
        pages_text.append(text)

    full_text = "\n\n".join(pages_text)
    return full_text, len(reader.pages)


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,;:!?()\[\]{}\-+/=%@#&*\"'`~]", " ", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 150) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        if end >= len(words):
            break
        start = max(end - overlap, start + 1)

    return chunks


def estimate_page_for_chunk(full_text: str, chunk: str, total_pages: int) -> int:
    if total_pages <= 1:
        return 1
    position = full_text.find(chunk[: min(80, len(chunk))])
    if position < 0:
        return 1
    ratio = position / max(len(full_text), 1)
    return max(1, min(total_pages, int(ratio * total_pages) + 1))

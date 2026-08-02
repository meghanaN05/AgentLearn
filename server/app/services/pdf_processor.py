from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

from pypdf import PdfReader

from app.config import get_settings

settings = get_settings()


def ensure_upload_dir() -> Path:
    path = Path(settings.upload_dir)
    path.mkdir(parents=True, exist_ok=True)
    return path


def extract_pages(file_path: str) -> list[str]:
    """Extract text page by page so chunks can keep an accurate page number."""
    reader = PdfReader(file_path)
    return [(page.extract_text() or "") for page in reader.pages]


def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^\w\s.,;:!?()\[\]{}\-+/=%@#&*\"'`~]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def chunk_pages(
    pages: list[str],
    chunk_size: int | None = None,
    overlap: int | None = None,
) -> list[dict]:
    """Chunk a document while tracking which page each chunk came from.

    Words are tagged with their source page before the sliding window runs, so a
    chunk straddling a page break still reports the page it mostly covers.
    """
    chunk_size = chunk_size or settings.chunk_size
    overlap = overlap or settings.chunk_overlap

    # (word, page_number) pairs; page numbers are 1-indexed for display.
    tagged: list[tuple[str, int]] = []
    for page_index, page_text in enumerate(pages):
        for word in clean_text(page_text).split():
            tagged.append((word, page_index + 1))

    if not tagged:
        return []

    chunks: list[dict] = []
    start = 0

    while start < len(tagged):
        end = min(start + chunk_size, len(tagged))
        window = tagged[start:end]
        content = " ".join(word for word, _ in window).strip()

        if content:
            # The page contributing the most words to the chunk wins the citation.
            page_number = Counter(page for _, page in window).most_common(1)[0][0]
            chunks.append(
                {
                    "content": content,
                    "page_number": page_number,
                    "chunk_index": len(chunks),
                }
            )

        if end >= len(tagged):
            break
        start = max(end - overlap, start + 1)

    return chunks

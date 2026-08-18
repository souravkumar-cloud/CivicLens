from dataclasses import dataclass
from typing import Optional


@dataclass
class DocumentMetadata:

    title: str
    department: str
    government: str
    state: str
    document_type: str
    language: str
    source_url: str
    published_date: Optional[str] = None
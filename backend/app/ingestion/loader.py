from pathlib import Path
from pypdf import PdfReader  # type: ignore[reportMissingImports]

def load_pdf(pdf_path: str):
    """
    Load a PDF and extract text from every page.
    """

    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    reader = PdfReader(str(path))

    documents = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text()

        if text and text.strip():
            documents.append({
                "text": text.strip(),
                "page": page_number,
                "source": path.name
            })

    return documents
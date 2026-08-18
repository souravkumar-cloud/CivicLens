import io

import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader


def fetch_url(url: str):

    headers = {
        "User-Agent": "CivicLens/0.1"
    }

    response = requests.get(
        url,
        headers=headers,
        timeout=30
    )

    response.raise_for_status()

    return response


def load_pdf_from_bytes(content: bytes):

    reader = PdfReader(
        io.BytesIO(content)
    )

    pages = []

    for page_number, page in enumerate(
        reader.pages,
        start=1
    ):

        text = page.extract_text()

        if text and text.strip():

            pages.append({
                "text": text.strip(),
                "page": page_number
            })

    return pages


def load_html_from_bytes(content: bytes):

    soup = BeautifulSoup(
        content,
        "html.parser"
    )

    for element in soup([
        "script",
        "style",
        "noscript",
        "nav",
        "footer",
        "header"
    ]):

        element.decompose()

    text = soup.get_text(
        separator="\n",
        strip=True
    )

    return [
        {
            "text": text,
            "page": 1
        }
    ]


def load_url(url: str):

    response = fetch_url(url)

    content_type = (
        response.headers
        .get("Content-Type", "")
        .lower()
    )

    print(
        f"Content-Type: {content_type}"
    )

    if (
        "application/pdf" in content_type
        or url.lower().split("?")[0].endswith(".pdf")
    ):

        pages = load_pdf_from_bytes(
            response.content
        )

        document_type = "pdf"

    elif "text/html" in content_type:

        pages = load_html_from_bytes(
            response.content
        )

        document_type = "html"

    else:

        raise ValueError(
            f"Unsupported content type: {content_type}"
        )

    return {
        "url": url,
        "document_type": document_type,
        "pages": pages
    }
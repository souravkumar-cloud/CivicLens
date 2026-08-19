# 🏛️ CivicLens

### AI-Powered Civic Information Assistant using Retrieval-Augmented Generation

CivicLens is an AI-powered civic information assistant designed to make government schemes, policies, and public-service information easier to understand.

Instead of relying only on an AI model's internal knowledge, CivicLens retrieves relevant information from government webpages and documents provided by the user and uses that information to generate grounded answers with source references.

> **CivicLens — Understand government information clearly.**

---

## 📌 Overview

Government information is often spread across:

- Government websites
- Scheme pages
- Official PDFs
- Policy documents
- Notifications
- Guidelines
- Department portals

Finding the correct information can be difficult because government documents often contain long sections, complex terminology, eligibility requirements, exclusion criteria, required documents, and application procedures.

CivicLens solves this problem using **Retrieval-Augmented Generation (RAG)**.

The basic workflow is:

```text
Government URL / Document
          ↓
     Text Extraction
          ↓
        Chunking
          ↓
      Embeddings
          ↓
       ChromaDB
          ↓
     User Question
          ↓
   Semantic Retrieval
          ↓
     Relevant Context
          ↓
       Gemini LLM
          ↓
   Grounded Answer
          ↓
    Source Reference
```

---

## ✨ Features

### 🔗 1. Dynamic Government URL Ingestion

Users can provide an official government webpage URL directly to CivicLens.

Example:

```
https://government.gov.in/scheme
```

CivicLens fetches the content and adds it to the searchable knowledge base.

### 📄 2. PDF Document Processing

CivicLens can process government PDF documents and extract their text.

The extracted content is then:

```text
PDF
 ↓
Text Extraction
 ↓
Chunking
 ↓
Embedding
 ↓
ChromaDB
```

This makes lengthy government documents searchable using natural-language questions.

### 🌐 3. Webpage Processing

CivicLens supports government webpages as knowledge sources.

The system extracts useful textual content from webpages and converts it into searchable chunks.

### 🧩 4. Intelligent Text Chunking

Large documents are divided into smaller chunks using:

`RecursiveCharacterTextSplitter`

Current configuration:

```
Chunk Size    : 1000
Chunk Overlap : 150
```

Chunking helps the retrieval system identify the most relevant sections of a large document.

### 🧠 5. Semantic Embeddings

CivicLens uses:

`all-MiniLM-L6-v2`

from Sentence Transformers.

Embedding dimension:

```
384
```

The model converts text into numerical vector representations.

This allows CivicLens to search based on semantic meaning rather than requiring exact keyword matches.

For example:

> "What is the maximum family income?"

can retrieve information such as:

> "A woman belonging to a family unit with an annual income not exceeding ₹2,50,000/- is eligible."

even though the wording is different.

### 🗄️ 6. ChromaDB Vector Database

CivicLens uses ChromaDB as its vector database.

The system stores:

- Document chunks
- Embeddings
- Source names
- Source URLs
- Page numbers
- Chunk identifiers

This allows relevant information to be retrieved efficiently.

### 🔍 7. Semantic Retrieval

When a user asks a question, CivicLens:

1. Converts the question into an embedding.
2. Searches ChromaDB.
3. Retrieves the most relevant document chunks.
4. Builds context from the retrieved chunks.
5. Sends the context to the LLM.
6. Generates a grounded answer.

### 🎯 8. Source Filtering

Users can select specific knowledge sources.

For example:

```
☑ Delhi Social Welfare Schemes
☐ Education Schemes
☐ Health Schemes
```

When a source is selected, CivicLens searches only the selected source.

This helps prevent unrelated documents from influencing the answer.

### 🔗 9. Source References

CivicLens returns information about the retrieved source.

Example:

```
Source: Delhi Social Welfare Schemes
Page: 1
Official Source: https://government.gov.in/scheme
```

Users can open the official source and independently verify the information.

### 🗑️ 10. Source Management

CivicLens allows users to:

- Add government sources
- View indexed sources
- Select sources
- Remove sources

This makes the knowledge base dynamic instead of requiring documents to be permanently hard-coded into the application.

### 🛡️ 11. Grounded Responses

CivicLens follows the principle:

> Retrieve first, generate second.

The LLM receives retrieved information from the CivicLens knowledge base instead of being asked to answer entirely from its internal knowledge.

If relevant information cannot be found in the available sources, CivicLens can indicate that the information was not found.

---

## 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │         USER          │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    Next.js Frontend   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      FastAPI API      │
                         └───────────┬───────────┘
                                     │
                  ┌──────────────────┴──────────────────┐
                  │                                     │
                  ▼                                     ▼
       ┌────────────────────┐                ┌────────────────────┐
       │ Government URL/PDF │                │   User Question    │
       └──────────┬─────────┘                └──────────┬─────────┘
                  │                                     │
                  ▼                                     ▼
       ┌────────────────────┐                ┌────────────────────┐
       │   Text Extraction  │                │  Query Embedding   │
       └──────────┬─────────┘                └──────────┬─────────┘
                  │                                     │
                  ▼                                     │
       ┌────────────────────┐                          │
       │      Chunking      │                          │
       └──────────┬─────────┘                          │
                  │                                     │
                  ▼                                     │
       ┌────────────────────┐                          │
       │     Embeddings     │                          │
       └──────────┬─────────┘                          │
                  │                                     │
                  └────────────────┬────────────────────┘
                                   ▼
                         ┌─────────────────────┐
                         │      ChromaDB       │
                         │   Vector Database   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │  Relevant Chunks    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    RAG Pipeline     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Gemini LLM      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                  ┌─────────────────────────────────┐
                  │       Answer + Sources          │
                  └─────────────────────────────────┘
```

---

## 🧰 Tech Stack

**Frontend**
- Next.js
- React
- JavaScript
- Tailwind CSS

**Backend**
- Python
- FastAPI
- Uvicorn

**AI / RAG**
- Google Gemini
- Sentence Transformers (`all-MiniLM-L6-v2`)
- LangChain Text Splitters

**Vector Database**
- ChromaDB

**Document Processing**
- PyPDF
- BeautifulSoup
- Requests

**Development Tools**
- Python Virtual Environment
- npm
- Git
- GitHub
- VS Code

---

## 📁 Project Structure

```text
CivicLens/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   └── routes.py
│   │   │
│   │   ├── ingestion/
│   │   │   ├── web_loader.py
│   │   │   ├── url_ingestion.py
│   │   │   ├── splitter.py
│   │   │   └── embeddings.py
│   │   │
│   │   ├── retrieval/
│   │   │   └── vectorstore.py
│   │   │
│   │   ├── rag/
│   │   │   └── pipeline.py
│   │   │
│   │   └── main.py
│   │
│   ├── vectorstore/
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
├── frontend/
│   │
│   ├── app/
│   │   ├── page.js
│   │   ├── layout.js
│   │   └── globals.css
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

Make sure the following are installed:

- Python 3.11+
- Node.js
- npm
- Git
- VS Code

### 🔧 Backend Setup

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project:

```bash
cd CivicLens
```

Navigate to the backend:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment on Windows:

```bash
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 🔐 Environment Variables

Create a `.env` file inside the backend directory:

```
backend/.env
```

Add your Google Gemini API key:

```
GOOGLE_API_KEY=your_google_api_key
```

> ⚠️ Never commit your `.env` file to GitHub.

### ▶️ Run the Backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```
http://127.0.0.1:8000/docs
```

### 💻 Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd CivicLens/frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```
http://localhost:3000
```

---

## 🔌 API Endpoints

CivicLens currently provides the following API endpoints.

### ❤️ Health Check

```
GET /api/v1/health
```

Checks whether the backend is running.

### 📚 Get Sources

```
GET /api/v1/sources
```

Returns the currently indexed sources.

Example:

```json
{
  "count": 1,
  "sources": [
    {
      "source_id": "abc123",
      "source": "Delhi Social Welfare Schemes",
      "source_url": "https://government.gov.in/scheme",
      "chunks": 10
    }
  ]
}
```

### 🔗 Ingest URL

```
POST /api/v1/ingest-url
```

Example request:

```json
{
  "url": "https://government.gov.in/scheme",
  "title": "Government Scheme"
}
```

The URL is fetched, processed, chunked, embedded, and stored in ChromaDB.

### 🗑️ Delete Source

```
DELETE /api/v1/sources/{source_id}
```

Deletes the chunks associated with a source.

### 🤖 Ask Question

```
POST /api/v1/ask
```

Example:

```json
{
  "question": "What is the income limit?"
}
```

To search a specific source:

```json
{
  "question": "What is the income limit?",
  "source_urls": [
    "https://government.gov.in/scheme"
  ]
}
```

Example response:

```json
{
  "answer": "The annual family income must not exceed ₹2,50,000.",
  "sources": [
    {
      "source": "Government Scheme",
      "page": 1,
      "source_url": "https://government.gov.in/scheme",
      "distance": 0.42
    }
  ]
}
```

---

## 🔄 RAG Pipeline

CivicLens follows a standard Retrieval-Augmented Generation workflow.

**Step 1 — Source Input**
The user provides a government URL or document.

**Step 2 — Content Extraction**
The system extracts textual content (HTML / PDF → Extracted Text).

**Step 3 — Chunking**
Large content is divided into smaller pieces (Chunk 1, Chunk 2, Chunk 3, ...).

**Step 4 — Embeddings**
Each chunk is converted into a vector using `all-MiniLM-L6-v2`.

**Step 5 — Vector Storage**
The vectors and metadata are stored in ChromaDB. Metadata includes information such as `source`, `source_url`, and `page`.

**Step 6 — User Question**
The user asks a natural-language question, e.g. "What is the income limit for this scheme?"

**Step 7 — Query Embedding**
The question is converted into an embedding using the same embedding model.

**Step 8 — Retrieval**
CivicLens performs semantic similarity search against ChromaDB. Relevant chunks are retrieved.

**Step 9 — Context Construction**
The retrieved chunks are combined into context for the LLM.

**Step 10 — Answer Generation**
Google Gemini generates an answer based on the retrieved context.

**Step 11 — Source Reference**
CivicLens returns the relevant source information so the user can verify the answer.

---

## 🧪 Example

Suppose an official government document contains:

> "A woman belonging to a family unit with an annual income not exceeding ₹2,50,000/- is eligible."

The user asks:

> "What is the income limit for this scheme?"

CivicLens performs:

```text
User Question
      ↓
Query Embedding
      ↓
ChromaDB Search
      ↓
Relevant Chunk
      ↓
RAG Context
      ↓
Gemini
      ↓
Answer
```

Example answer:

> "The annual family income must not exceed ₹2,50,000."

The response can also include:

```
Source: Delhi Social Welfare Schemes
Page: 1
Official Source: Government URL
```

---

## 🛡️ Reliability and Hallucination Control

CivicLens follows the principle:

> Retrieve first, generate second.

The model is provided with retrieved evidence from the CivicLens knowledge base.

If relevant information is unavailable, CivicLens is designed to indicate that the information was not found rather than intentionally inventing unsupported information.

However, because the final answer is generated by an LLM, users should verify important information against the official government source.

---

## ⚠️ API Quota

CivicLens uses the Google Gemini API for answer generation.

The application therefore depends on the API quota and availability of the configured Gemini project.

If the Gemini API quota is exceeded, document ingestion and vector retrieval can still work, but answer generation may temporarily fail until the API quota becomes available again.

---

## 🔒 Security

Never commit API keys or private environment files.

The following should be excluded from Git:

```
.env
.env.local
venv/
node_modules/
vectorstore/
.next/
```

Example `.gitignore`:

```gitignore
# Python
__pycache__/
*.pyc
venv/

# Environment
.env
.env.local

# ChromaDB
vectorstore/

# Node
node_modules/
.next/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 🧪 Testing

Backend health:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

Open API documentation:

```
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to test:

```
GET     /api/v1/health
GET     /api/v1/sources
POST    /api/v1/ingest-url
DELETE  /api/v1/sources/{source_id}
POST    /api/v1/ask
```

---

## 📊 Current Project Status

| Feature | Status |
|---|---|
| Dynamic URL ingestion | ✅ |
| PDF processing | ✅ |
| Webpage processing | ✅ |
| Text extraction | ✅ |
| Text chunking | ✅ |
| Metadata preservation | ✅ |
| Embeddings | ✅ |
| ChromaDB | ✅ |
| Semantic retrieval | ✅ |
| Source filtering | ✅ |
| Source management | ✅ |
| RAG pipeline | ✅ |
| Gemini integration | ✅ |
| Source references | ✅ |
| Next.js frontend | ✅ |
| Hybrid search | ⏳ |
| BM25 search | ⏳ |
| Reranking | ⏳ |
| Authentication | ⏳ |
| Multi-user support | ⏳ |
| Production deployment | ⏳ |

---

## 🚧 Current Limitations

CivicLens MVP currently has the following limitations:

- Retrieval currently relies primarily on semantic vector search.
- Hybrid BM25 + vector retrieval is not implemented.
- Reranking is not implemented.
- Authentication is not implemented.
- The vector database is currently local ChromaDB.
- Background document processing is not implemented.
- Gemini API usage depends on the configured quota.
- Some government websites may restrict automated requests.
- Government webpages can change over time.
- Answer quality depends on the quality and completeness of the provided source.

---

## 🗺️ Future Roadmap

### Phase 3 — Advanced Retrieval

- Hybrid search
- BM25
- Reciprocal Rank Fusion
- Reranking
- Query expansion
- Better chunking strategies
- Metadata-aware retrieval

### Phase 4 — Trust and Citation Layer

- Exact evidence highlighting
- Citation verification
- Confidence scoring
- Hallucination detection
- Evidence validation
- Sentence-level citations

### Phase 5 — Civic Intelligence

- Scheme recommendations
- Eligibility checking
- Multi-document comparison
- Policy comparison
- Simplified government-language explanations
- Multilingual support

### Phase 6 — Production Infrastructure

- PostgreSQL
- User authentication
- User accounts
- Persistent source management
- Background ingestion
- Caching
- Monitoring
- Logging

---

## 💡 Why CivicLens?

Government information should be:

```text
Easy to find
      ↓
Easy to understand
      ↓
Easy to verify
```

CivicLens attempts to transform:

```text
Long Government Documents
            ↓
      RAG Retrieval
            ↓
      Simple Answers
            ↓
       Source Links
```

The objective is not to replace official government information.

Instead, CivicLens acts as an AI-powered interface over official information, helping users locate and understand relevant information faster.

---

## 🎓 What This Project Demonstrates

CivicLens demonstrates practical implementation of:

- Retrieval-Augmented Generation
- Vector databases
- Semantic search
- Embedding models
- Document ingestion
- PDF processing
- Web content extraction
- Text chunking
- Metadata filtering
- FastAPI
- REST APIs
- Next.js
- React
- Tailwind CSS
- Google Gemini
- Sentence Transformers
- ChromaDB
- Source attribution
- AI application architecture

---

## 💼 Resume Description

**CivicLens — AI-Powered Civic Information Assistant**

Built a Retrieval-Augmented Generation (RAG) based civic information assistant that dynamically ingests government webpages and documents, extracts and chunks content, generates semantic embeddings using Sentence Transformers, stores vectors and metadata in ChromaDB, retrieves relevant information based on user queries, and generates grounded responses using Google Gemini. Implemented dynamic source ingestion, metadata-aware source filtering, source management, and source-backed responses through a FastAPI backend and Next.js frontend.

**Technologies:** Python, FastAPI, Next.js, React, ChromaDB, Sentence Transformers, LangChain, Google Gemini, Tailwind CSS, REST APIs

---

## 📸 Demo Flow

The intended user experience is:

1. Open CivicLens
2. Paste an official government URL
3. Click "Add Source"
4. CivicLens processes the source
5. Source appears in Knowledge Sources
6. Select the source
7. Ask a question
8. CivicLens retrieves relevant information
9. Gemini generates the answer
10. Source information is displayed
11. User can verify the official source

---

## 🌟 Project Vision

CivicLens is built around a simple idea:

> Government information should be accessible without requiring citizens to navigate complicated documents and websites.

The long-term vision is to build an intelligent civic information layer that helps citizens understand:

- Government schemes
- Eligibility criteria
- Public services
- Policies
- Benefits
- Required documents
- Application procedures
- Government notifications

while keeping the original official source available for verification.

---

## 👨‍💻 Author

**Bala**

CivicLens is an AI/RAG portfolio project focused on applying Retrieval-Augmented Generation to real-world civic and government information.

---

## 📜 License

This project is currently intended for educational and portfolio purposes.

If you plan to distribute or modify the project publicly, add an appropriate open-source license such as MIT.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**CivicLens** — *Understand government information clearly.*

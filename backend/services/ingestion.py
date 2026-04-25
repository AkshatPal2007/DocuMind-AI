# backend/services/ingestion.py
from langchain_community.document_loaders import PyPDFLoader, TextLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from backend.utils.pdf_parser import parse_file
from backend.utils.chunking import chunk_documents
from backend.services.vector_db_service import vector_db
import os

CHROMA_DIR = "data/chroma_db"

from backend.services.db_service import db_service

def load_document(file_path: str):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return PyPDFLoader(file_path).load()
    elif ext == ".txt":
        return TextLoader(file_path).load()
    elif ext == ".csv":
        return CSVLoader(file_path).load()
    else:
        raise ValueError("Unsupported file type")

def ingest_document(file_path: str, user_id: str) -> dict:
    docs = parse_file(file_path)
    chunks = chunk_documents(docs)

    if not chunks:
        raise ValueError("No text extracted.")

    file_name = os.path.basename(file_path)

    # Add user_id to all chunks metadata
    for chunk in chunks:
        chunk.metadata["user_id"] = user_id
        chunk.metadata["file_name"] = file_name

    # Inject a summary chunk from first 2 pages
    # so "what is this about" / "summary" queries always hit the intro
    first_pages = docs[:2]
    summary_text = " ".join([d.page_content for d in first_pages])
    
    from langchain_core.documents import Document
    summary_chunk = Document(
        page_content=(
            f"DOCUMENT SUMMARY — {file_name}\n"
            f"The following is the abstract and introduction of this document, "
            f"which provides an overview and summary of its key topics:\n\n"
            f"{summary_text[:2000]}"
        ),
        metadata={
            "source": file_path,
            "file_name": file_name,
            "page": 0,
            "chunk_type": "summary",
            "user_id": user_id
        }
    )
    chunks = [summary_chunk] + chunks

    vector_db.add_documents(chunks)

    if hasattr(vector_db.db, 'persist'):
        vector_db.db.persist()
        
    # Log to Postgres
    try:
        db_service.add_file(user_id, file_name, file_path, len(docs), len(chunks))
    except Exception as e:
        print(f"Warning: Failed to add file record to Postgres: {e}")

    return {
        "file": file_path,
        "pages": len(docs),
        "chunks": len(chunks),
        "total_indexed": vector_db.get_collection_count()
    }
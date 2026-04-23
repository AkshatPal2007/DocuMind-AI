from langchain_community.document_loaders import (
    PyPDFLoader, TextLoader, CSVLoader, UnstructuredWordDocumentLoader
)
from langchain_core.documents import Document
from typing import List
import os

def parse_file(file_path: str) -> List[Document]:
    ext = os.path.splitext(file_path)[1].lower()
    
    loaders = {
        ".pdf":  PyPDFLoader,
        ".txt":  TextLoader,
        ".csv":  CSVLoader,
        ".docx": UnstructuredWordDocumentLoader,
    }

    if ext not in loaders:
        raise ValueError(f"Unsupported file type: {ext}")

    loader = loaders[ext](file_path)
    docs = loader.load()

    # Normalize metadata
    for doc in docs:
        doc.metadata["file_name"] = os.path.basename(file_path)
        doc.metadata["file_type"] = ext

    return docs
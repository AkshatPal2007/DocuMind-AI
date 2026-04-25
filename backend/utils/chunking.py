import re
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List

def is_reference_chunk(text: str) -> bool:
    """
    Detects bibliography/reference chunks generically.
    Works for academic papers, legal docs, reports, any format.
    """
    lines = text.strip().split('\n')
    total_lines = len(lines)
    if total_lines == 0:
        return False
    
    # Signal 1: High density of citation-like patterns
    # Matches [1], [23], (2023), Author, A. et al.
    citation_pattern = re.compile(
        r'(\[\d+\]|\(\d{4}\)|et al\.|pp\.\s*\d|doi:|arXiv:|ISBN:|Vol\.\s*\d|No\.\s*\d)'
    )
    citation_hits = sum(1 for line in lines if citation_pattern.search(line))
    citation_density = citation_hits / total_lines

    # Signal 2: High density of lines starting with author-like patterns
    # "Smith, J.", "Johnson, A. and", "[12] Brown"
    author_pattern = re.compile(r'^(\[\d+\]|[A-Z][a-z]+,\s[A-Z]\.)')
    author_hits = sum(1 for line in lines if author_pattern.match(line.strip()))
    author_density = author_hits / total_lines

    # Signal 3: Very few sentences (references are fragments, not prose)
    sentence_count = len(re.findall(r'[.!?]+', text))
    word_count = len(text.split())
    prose_ratio = sentence_count / max(word_count, 1)

    # Reference chunk if citation_density > 30% OR author_density > 25%
    return citation_density > 0.3 or author_density > 0.25

def detect_chunk_type(chunk_text: str, metadata: dict) -> str:
    """
    Works for: research papers, legal docs, resumes,
               financial reports, manuals, books, anything.
    """
    text = chunk_text.strip()
    text_lower = text.lower()

    # References / Bibliography
    if is_reference_chunk(text):
        return "reference"

    # Table of Contents (lots of dots and page numbers)
    toc_pattern = re.compile(r'\.{3,}\s*\d+')
    if len(re.findall(toc_pattern, text)) > 3:
        return "toc"

    # Headers / Section titles (very short, mostly caps or title case)
    if len(text) < 200 and text.isupper():
        return "header"

    # Tables (lots of | or tab-separated numbers)
    if text.count('|') > 5 or text.count('\t') > 5:
        return "table"

    # Footer/Header noise (page numbers, document titles repeating)
    if len(text) < 100 and re.search(r'page \d+|^\d+$', text_lower):
        return "noise"

    # Everything else is content
    return "content"

def chunk_documents(docs: List[Document], 
                    chunk_size: int = 500, 
                    chunk_overlap: int = 150) -> List[Document]:
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = splitter.split_documents(docs)
    
    # Add chunk index to metadata for traceability
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i
        chunk.metadata["chunk_total"] = len(chunks)
        # Tag every chunk with its type
        chunk.metadata["chunk_type"] = detect_chunk_type(
            chunk.page_content,
            chunk.metadata
        )
    
    return chunks
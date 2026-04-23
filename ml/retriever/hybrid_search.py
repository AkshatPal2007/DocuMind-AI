from backend.services.vector_db_service import vector_db
from langchain_core.documents import Document
from typing import List, Tuple

def semantic_search(query: str, k: int = 4) -> List[Document]:
    return vector_db.similarity_search(query, k=k)

def search_with_scores(query: str, k: int = 6, file_name: str = None) -> List[Tuple[Document, float]]:
    filter_dict = {"file_name": file_name} if file_name else None
    return vector_db.similarity_search_with_score(query, k=k, filter=filter_dict)

def format_context(docs_with_scores: List[Tuple[Document, float]]) -> str:
    """Formats retrieved docs into a clean context string for the LLM."""
    context_parts = []
    
    for i, (doc, score) in enumerate(docs_with_scores):
        source = doc.metadata.get("file_name", "Unknown")
        page   = doc.metadata.get("page", "?")
        
        context_parts.append(
            f"[Source {i+1} | File: {source} | Page: {page} | Score: {score:.2f}]\n"
            f"{doc.page_content}"
        )
    
    return "\n\n---\n\n".join(context_parts)
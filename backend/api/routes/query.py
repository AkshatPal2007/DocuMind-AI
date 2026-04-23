# backend/api/routes/query.py
"""
/api/query — Retrieval-only endpoint (no LLM).
Useful for debugging what chunks the system retrieves for a given question.
"""

from fastapi import APIRouter

from backend.schemas.request import QueryRequest
from backend.schemas.response import QueryResponse, SourceChunk
from ml.retriever.hybrid_search import search_with_scores

router = APIRouter()


@router.post("/query")
def query_docs(req: QueryRequest):
    """Return the top-k retrieved chunks with scores (no LLM generation)."""
    results = search_with_scores(req.query, k=req.k)

    return QueryResponse(
        query=req.query,
        results=[
            SourceChunk(
                content=doc.page_content,
                source=doc.metadata.get("file_name"),
                page=doc.metadata.get("page"),
                score=round(score, 4),
            )
            for doc, score in results
        ],
    )
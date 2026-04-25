# backend/api/routes/query.py
"""
/api/query — Retrieval-only endpoint (no LLM).
Useful for debugging what chunks the system retrieves for a given question.
"""

from fastapi import APIRouter, Depends

from backend.schemas.request import QueryRequest
from backend.schemas.response import QueryResponse, SourceChunk
from ml.retriever.hybrid_search import search_with_scores
from backend.api.deps import get_current_user

router = APIRouter()


@router.post("/query")
def query_docs(req: QueryRequest, user_id: str = Depends(get_current_user)):
    """Return the top-k retrieved chunks with scores (no LLM generation)."""
    results = search_with_scores(req.query, k=req.k, user_id=user_id)

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
# backend/schemas/response.py
from pydantic import BaseModel
from typing import List, Optional


class SourceChunk(BaseModel):
    """A single retrieved chunk returned alongside the answer."""
    content: str
    source: Optional[str] = None
    page: Optional[int] = None
    score: float


class ChatResponse(BaseModel):
    """Non-streaming response for the /api/chat endpoint."""
    question: str
    answer: str
    sources: List[SourceChunk]


class QueryResponse(BaseModel):
    """Response for the /api/query (retrieval-only) endpoint."""
    query: str
    results: List[SourceChunk]

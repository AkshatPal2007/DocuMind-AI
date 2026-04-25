# backend/schemas/request.py
from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """Request body for the /api/chat endpoint."""
    question: str = Field(..., min_length=1, description="The user's question")
    k: int = Field(default=4, ge=1, le=20, description="Number of chunks to retrieve")
    model: Optional[str] = Field(default=None, description="Model ID (e.g. 'nvidia/meta/llama-3.3-70b-instruct')")
    temperature: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="LLM sampling temperature")
    file_name: Optional[str] = Field(default=None, description="Scope search to a specific document")
    session_id: str = Field(default="default", description="Session identifier for future multi-turn support")


class QueryRequest(BaseModel):
    """Request body for the /api/query (retrieval-only) endpoint."""
    query: str = Field(..., min_length=1, description="Search query")
    k: int = Field(default=4, ge=1, le=20, description="Number of results to return")

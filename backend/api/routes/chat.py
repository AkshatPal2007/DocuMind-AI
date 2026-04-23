# backend/api/routes/chat.py
"""
/api/chat        — Direct RAG (Phase 5, fast, single LLM call)
/api/agent-chat  — Multi-Agent pipeline (Phase 6, LangGraph orchestrated)
/api/models      — Available models for the frontend selector

Both support ?stream=false for JSON responses.
"""

from fastapi import APIRouter, Query

from backend.schemas.request import ChatRequest
from backend.schemas.response import ChatResponse
from backend.services.llm_service import generate_answer
from backend.orchestrator.langgraph_flow import run_pipeline
from backend.services.llm_provider import get_available_models

router = APIRouter()


# ── Models list endpoint ─────────────────────────────────────────────────

@router.get("/models")
async def list_models():
    """Return available models (those with valid API keys)."""
    return {"models": get_available_models()}


# ── Direct RAG endpoint (Phase 5) ───────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest, stream: bool = Query(default=False)):
    """
    Ask a question — direct RAG (fast, single LLM call).
    """
    answer, sources = generate_answer(req.question, k=req.k, model_id=req.model)
    return ChatResponse(
        question=req.question,
        answer=answer,
        sources=sources,
    )


# ── Multi-Agent endpoint (Phase 6) ──────────────────────────────────────

@router.post("/agent-chat")
async def agent_chat(req: ChatRequest):
    """
    Ask a question — multi-agent pipeline (LangGraph orchestrated).
    Retrieval → Reasoning → Critique → Summary with retry loop.
    Always returns JSON.
    """
    result = run_pipeline(question=req.question, k=req.k, model_id=req.model, file_name=req.file_name)

    return {
        "question": result["question"],
        "answer": result["answer"],
        "sources": [s.model_dump() for s in result["sources"]],
        "metadata": {
            "attempts": result["attempts"],
            "grounded": result["grounded"],
            "critique_reason": result["critique_reason"],
        },
    }
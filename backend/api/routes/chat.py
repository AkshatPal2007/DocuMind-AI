# backend/api/routes/chat.py
"""
/api/chat        — Direct RAG (Phase 5, fast, single LLM call)
/api/agent-chat  — Multi-Agent pipeline (Phase 6, LangGraph orchestrated)
/api/models      — Available models for the frontend selector
"""

from fastapi import APIRouter, Query, Depends

from backend.schemas.request import ChatRequest
from backend.schemas.response import ChatResponse
from backend.services.llm_service import generate_answer
from backend.orchestrator.langgraph_flow import run_pipeline
from backend.services.llm_provider import get_available_models
from backend.core.logger import get_logger
from backend.api.deps import get_current_user

router = APIRouter()
logger = get_logger(__name__)


# ── Models list endpoint ─────────────────────────────────────────────────

@router.get("/models")
async def list_models():
    """Return available models (those with valid API keys)."""
    models = get_available_models()
    logger.info("Models listed", extra={"count": len(models)})
    return {"models": models}


# ── Direct RAG endpoint (Phase 5) ───────────────────────────────────────

@router.post("/chat")
async def chat(req: ChatRequest, stream: bool = Query(default=False), user_id: str = Depends(get_current_user)):
    """Direct RAG — fast, single LLM call."""
    logger.info("Direct chat", extra={"question": req.question[:80], "model": req.model, "temperature": req.temperature})
    answer, sources = generate_answer(
        req.question,
        k=req.k,
        model_id=req.model,
        user_id=user_id,
        temperature=req.temperature,
    )
    return ChatResponse(
        question=req.question,
        answer=answer,
        sources=sources,
    )


# ── Multi-Agent endpoint  ──────────────────────────────────────

@router.post("/agent-chat")
async def agent_chat(req: ChatRequest, user_id: str = Depends(get_current_user)):
    """Multi-agent pipeline — LangGraph orchestrated."""
    logger.info("Agent chat", extra={
        "question": req.question[:80], "model": req.model, "file": req.file_name, "temperature": req.temperature
    })

    result = run_pipeline(
        question=req.question, k=req.k,
        model_id=req.model, file_name=req.file_name,
        user_id=user_id, temperature=req.temperature,
    )

    logger.info("Agent chat complete", extra={
        "grounded": result["grounded"], "attempts": result["attempts"]
    })

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
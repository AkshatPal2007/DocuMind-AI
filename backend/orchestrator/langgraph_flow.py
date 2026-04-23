# backend/orchestrator/langgraph_flow.py
"""
LangGraph Orchestrator — The Brain of DocuMind.

Wires all agents into a stateful graph:

    User Query
      ↓
    [Retrieval Agent]   →  top-k docs + context
      ↓
    [Reasoning Agent]   →  raw LLM answer
      ↓
    [Critique Agent]    →  grounded?  YES → continue  /  NO → re-retrieve (max 2 retries)
      ↓
    [Summary Agent]     →  polished answer with citations
      ↓
    Final Response
"""

from typing import TypedDict, List, Tuple, Optional
from langgraph.graph import StateGraph, END, START
from langchain_core.documents import Document

from backend.agents.retrieval_agent import RetrievalAgent
from backend.agents.reasoning_agent import ReasoningAgent
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.summary_agent import SummaryAgent
from backend.schemas.response import SourceChunk

MAX_RETRIES = 2


# ── Graph State ──────────────────────────────────────────────────────────

class PipelineState(TypedDict):
    """State that flows through the LangGraph pipeline."""
    # Inputs
    question: str
    k: int
    model_id: Optional[str]
    file_name: Optional[str]

    # Retrieval outputs
    docs_with_scores: List[Tuple[Document, float]]
    context: str
    sources: List[dict]

    # Reasoning output
    raw_answer: str

    # Critique output
    grounded: bool
    critique_reason: str
    refined_query: str

    # Summary output
    final_answer: str

    # Control
    attempt: int


# ── Agent singletons ─────────────────────────────────────────────────────

_retrieval_agent = RetrievalAgent()
_reasoning_agent = ReasoningAgent()
_critique_agent = CritiqueAgent()
_summary_agent = SummaryAgent()


# ── Node functions ───────────────────────────────────────────────────────

def retrieve_node(state: PipelineState) -> dict:
    """Run the Retrieval Agent."""
    # Use refined_query if available (from a critique retry), else original question
    query = state.get("refined_query") or state["question"]
    k = state.get("k", 4)
    file_name = state.get("file_name")

    result = _retrieval_agent.run(query, k=k, file_name=file_name)

    # Build source metadata list
    sources = [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("file_name"),
            "page": doc.metadata.get("page"),
            "score": round(score, 4),
        }
        for doc, score in result["docs_with_scores"]
    ]

    return {
        "docs_with_scores": result["docs_with_scores"],
        "context": result["context"],
        "sources": sources,
    }


def reasoning_node(state: PipelineState) -> dict:
    """Run the Reasoning Agent."""
    raw_answer = _reasoning_agent.run(
        question=state["question"],
        context=state["context"],
        model_id=state.get("model_id"),
    )
    return {"raw_answer": raw_answer}


def rewrite_query_on_failure(original: str, critique_reason: str, attempt: int) -> str:
    """
    Rewrites the query based on why critique failed.
    """
    rewrites = {
        1: original + " definition explanation overview",
        2: " ".join(original.split()[:3]) + " meaning purpose",
    }
    return rewrites.get(attempt, original)


def critique_node(state: PipelineState) -> dict:
    """Run the Critique Agent."""
    result = _critique_agent.run(
        question=state["question"],
        context=state["context"],
        answer=state["raw_answer"],
        model_id=state.get("model_id"),
    )
    
    attempt = state.get("attempt", 0) + 1
    refined_query = result.get("refined_query", "")
    
    # Fallback to deterministic rewrite if critique failed
    if not result["grounded"]:
        refined_query = rewrite_query_on_failure(state["question"], result["reason"], attempt)

    return {
        "grounded": result["grounded"],
        "critique_reason": result["reason"],
        "refined_query": refined_query,
        "attempt": attempt,
    }


def summary_node(state: PipelineState) -> dict:
    """Run the Summary Agent."""
    final_answer = _summary_agent.run(
        state["raw_answer"],
        model_id=state.get("model_id"),
    )
    return {"final_answer": final_answer}


# ── Conditional edge ─────────────────────────────────────────────────────

def should_retry(state: PipelineState) -> str:
    """
    After critique, decide whether to retry retrieval or proceed to summary.
    Returns the name of the next node.
    """
    if not state.get("grounded", True) and state.get("attempt", 0) < MAX_RETRIES:
        return "retrieve"
    return "summarize"


# ── Build the graph ──────────────────────────────────────────────────────

def build_pipeline() -> StateGraph:
    """Construct and compile the LangGraph pipeline."""
    graph = StateGraph(PipelineState)

    # Add nodes
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("reason", reasoning_node)
    graph.add_node("critique", critique_node)
    graph.add_node("summarize", summary_node)

    # Add edges
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "reason")
    graph.add_edge("reason", "critique")
    graph.add_conditional_edges("critique", should_retry)
    graph.add_edge("summarize", END)

    return graph.compile()


# ── Compiled pipeline singleton ──────────────────────────────────────────

pipeline = build_pipeline()


# ── Public API ───────────────────────────────────────────────────────────

def run_pipeline(question: str, k: int = 4, model_id: str = None, file_name: str = None) -> dict:
    """
    Run the full multi-agent pipeline.

    Args:
        question: The user's question.
        k: Number of chunks to retrieve.
        model_id: LLM model identifier (e.g. 'nvidia/meta/llama-3.3-70b-instruct').

    Returns:
        dict with keys: question, answer, sources, attempts, grounded, critique_reason
    """
    initial_state = {
        "question": question,
        "k": k,
        "model_id": model_id,
        "file_name": file_name,
        "docs_with_scores": [],
        "context": "",
        "sources": [],
        "raw_answer": "",
        "grounded": False,
        "critique_reason": "",
        "refined_query": "",
        "final_answer": "",
        "attempt": 0,
    }

    final_state = pipeline.invoke(initial_state)

    return {
        "question": final_state["question"],
        "answer": final_state["final_answer"],
        "sources": [
            SourceChunk(**s) for s in final_state["sources"]
        ],
        "attempts": final_state.get("attempt", 1),
        "grounded": final_state.get("grounded", True),
        "critique_reason": final_state.get("critique_reason", ""),
    }

# backend/services/llm_service.py
"""
LLM service — uses the unified provider to support Gemini, NVIDIA, and Groq.
"""

import json
from typing import Generator, Tuple, List

from ml.retriever.hybrid_search import search_with_scores, format_context
from backend.schemas.response import SourceChunk
from backend.services.llm_provider import generate

SYSTEM_PROMPT = """You are DocuMind, an expert document analysis assistant.

STRICT RULES — violating any of these is a critical failure:
1. ONLY use information that is EXPLICITLY stated in the provided context chunks below. Do NOT add any outside knowledge, assumptions, or inferences.
2. If a concept, term, or technique is NOT mentioned in the context, do NOT mention it in your answer.
3. Cite sources using [Source N] notation. Every factual claim must map to a specific source.
4. If the context does not contain enough information to answer the question, say exactly: "I couldn't find sufficient information about this in the uploaded documents."
5. For summary requests: synthesize ONLY what the context chunks explicitly say. Structure with bullet points and headings for readability.
6. NEVER fabricate examples, methods, libraries, or techniques that are not in the context.
7. When in doubt, quote the context directly rather than paraphrasing.

IMPORTANT: For glossary/definition documents, if the user asks
"what is X", search for X as a term entry, not as a prose explanation.
The answer may be a direct definition from a table or list.
"""


def _retrieve(question: str, k: int = 6, user_id: str = None) -> Tuple[str, List[SourceChunk]]:
    """Retrieve top-k chunks and return (formatted_context, source_list)."""
    docs_with_scores = search_with_scores(question, k=k, user_id=user_id)

    context = format_context(docs_with_scores)

    sources = [
        SourceChunk(
            content=doc.page_content,
            source=doc.metadata.get("file_name"),
            page=doc.metadata.get("page"),
            score=round(score, 4),
        )
        for doc, score in docs_with_scores
    ]

    return context, sources


# ── Non-streaming (JSON) ────────────────────────────────────────────────

def generate_answer(
    question: str,
    k: int = 6,
    model_id: str = None,
    user_id: str = None,
    temperature: float = None,
) -> Tuple[str, List[SourceChunk]]:
    """
    Returns (answer_text, sources) in one shot.
    """
    context, sources = _retrieve(question, k=k, user_id=user_id)

    user_prompt = f"Context:\n{context}\n\nQuestion: {question}"
    answer = generate(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model_id=model_id,
        temperature=temperature,
    )

    return answer, sources

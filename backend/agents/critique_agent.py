# backend/agents/critique_agent.py
"""
Critique Agent — checks whether the answer is grounded in the provided context.
"""

import json
from backend.services.llm_provider import generate

CRITIQUE_PROMPT = """You are a grounding checker for a document Q&A system.

You will receive:
- CONTEXT: the source documents
- QUESTION: the user's question
- ANSWER: a proposed answer

Your job is to determine:
1. Is the ANSWER factually supported by the CONTEXT?
2. Does the ANSWER avoid making claims not present in the CONTEXT?

Respond with EXACTLY this JSON format (no extra text):
{
  "grounded": true or false,
  "reason": "brief explanation",
  "refined_query": "a better search query if not grounded, otherwise empty string"
}"""


class CritiqueAgent:
    """Checks if an answer is grounded in the context."""

    def run(self, question: str, context: str, answer: str, model_id: str = None) -> dict:
        raw = generate(
            system_prompt=CRITIQUE_PROMPT,
            user_prompt=f"CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\nANSWER:\n{answer}",
            model_id=model_id,
            json_mode=True,
        )

        try:
            result = json.loads(raw)
        except json.JSONDecodeError:
            result = {
                "grounded": True,
                "reason": "Could not parse critique response — assuming grounded.",
                "refined_query": "",
            }

        return {
            "grounded": bool(result.get("grounded", True)),
            "reason": result.get("reason", ""),
            "refined_query": result.get("refined_query", ""),
        }

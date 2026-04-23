# backend/agents/summary_agent.py
"""
Summary Agent — condenses long answers and ensures proper [Source N] citations.
"""

from backend.services.llm_provider import generate

SUMMARY_PROMPT = """You are a document assistant summarizer.

You will receive a raw answer that was generated from document context.
Your job is to:
1. Make it concise and well-structured (use bullet points if helpful).
2. Keep all [Source N] citations exactly as they appear.
3. Do NOT add information that was not in the original answer.
4. If the answer says it couldn't find information, keep that message.

Return ONLY the polished answer — no preamble, no "Here is the summary", just the answer."""


class SummaryAgent:
    """Condenses a raw answer and ensures citations are preserved."""

    def run(self, raw_answer: str, model_id: str = None) -> str:
        return generate(
            system_prompt=SUMMARY_PROMPT,
            user_prompt=raw_answer,
            model_id=model_id,
        )

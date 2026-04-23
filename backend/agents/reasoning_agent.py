# backend/agents/reasoning_agent.py
"""
Reasoning Agent — sends context + question to the LLM and returns a raw answer.
"""

from backend.services.llm_provider import generate

REASONING_PROMPT = """You are DocuMind, an intelligent document assistant.
Answer the user's question ONLY based on the provided context.
Always cite your sources using [Source N] notation matching the source numbers in the context.
If the answer isn't in the context, say "I couldn't find this in the uploaded documents."
Be thorough but concise."""


class ReasoningAgent:
    """Sends context + question to the LLM and returns the raw answer."""

    def run(self, question: str, context: str, model_id: str = None) -> str:
        return generate(
            system_prompt=REASONING_PROMPT,
            user_prompt=f"Context:\n{context}\n\nQuestion: {question}",
            model_id=model_id,
        )

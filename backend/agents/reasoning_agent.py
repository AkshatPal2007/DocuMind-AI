# backend/agents/reasoning_agent.py
"""
Reasoning Agent — sends context + question to the LLM and returns a raw answer.
"""

from backend.services.llm_provider import generate

REASONING_PROMPT = """You are DocuMind, an intelligent document assistant.
Answer the user's question based on the provided context.

Rules:
1. Use ONLY information from the context — do not use outside knowledge.
2. Cite your sources using [Source N] notation matching source numbers in the context.
3. If the context contains ANY relevant information (definitions, mentions, descriptions, glossary entries, table rows, bullet points), extract and present it — even if it is brief.
4. Only say "I couldn't find information on the uploaded documents." if NONE of the sources contain anything related to the question.
5. For definition/term questions, look for glossary entries, bullet points, and descriptions — not just full paragraphs.
6. Be thorough but concise."""


class ReasoningAgent:
    """Sends context + question to the LLM and returns the raw answer."""

    def run(self, question: str, context: str, model_id: str = None) -> str:
        return generate(
            system_prompt=REASONING_PROMPT,
            user_prompt=f"Context:\n{context}\n\nQuestion: {question}",
            model_id=model_id,
        )

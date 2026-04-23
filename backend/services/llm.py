from google import genai
import os
from typing import Generator

_client = None
MODEL = "gemini-2.0-flash"

SYSTEM_PROMPT = """You are DocuMind, an intelligent document assistant.
Answer questions ONLY based on the provided context.
Always cite your sources using [Source N] notation.
If the answer isn't in the context, say "I couldn't find this in the uploaded documents."
"""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY environment variable is not set")
        _client = genai.Client(api_key=api_key)
    return _client


def stream_answer(question: str, context: str) -> Generator:
    response = _get_client().models.generate_content_stream(
        model=MODEL,
        contents=f"Context:\n{context}\n\nQuestion: {question}",
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
    )
    for chunk in response:
        if chunk.text:
            yield f"data: {chunk.text}\n\n"
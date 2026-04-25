# backend/agents/retrieval_agent.py
"""
Retrieval Agent — calls hybrid_search and returns top-k documents with scores.
This agent is responsible for finding the most relevant chunks from the vector DB.
"""

from typing import List, Tuple
from langchain_core.documents import Document
from ml.retriever.hybrid_search import search_with_scores, format_context


class RetrievalAgent:
    """Retrieves relevant document chunks for a given query."""

    def run(self, query: str, k: int = 4, file_name: str = None, user_id: str = None) -> dict:
        """
        Retrieve top-k chunks from the vector store.

        Args:
            query: The search query string.
            k: Number of chunks to retrieve.
            file_name: Optional filter for a specific document.
            user_id: Optional filter for a specific user.

        Returns:
            dict with keys:
                - docs_with_scores: list of (Document, float) tuples
                - context: formatted context string for the LLM
        """
        docs_with_scores = search_with_scores(query, k=k, file_name=file_name, user_id=user_id)
        context = format_context(docs_with_scores)

        return {
            "docs_with_scores": docs_with_scores,
            "context": context,
        }

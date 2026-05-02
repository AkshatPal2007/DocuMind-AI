# backend/agents/ingestion_agent.py
"""
Ingestion Agent — wraps the existing ingestion service.
Triggered on file upload, not during the query flow.
Included for architectural completeness in the multi-agent system.
"""

from backend.services.ingestion import ingest_document


class IngestionAgent:
    """Parses, chunks, embeds, and stores a document in the vector DB."""

    def run(self, file_path: str, user_id: str = None) -> dict:
        """
        Ingest a document into the vector store.

        Args:
            file_path: Path to the uploaded file on disk.
            user_id: ID of the user uploading the file.

        Returns:
            dict with keys: file, pages, chunks, total_indexed
        """
        return ingest_document(file_path, user_id)

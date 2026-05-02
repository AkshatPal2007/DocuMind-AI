from langchain_community.vectorstores import Chroma
from ml.embeddings.embedder import embedder
from langchain_core.documents import Document
from typing import List
from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)


class VectorDBService:
    def __init__(self):
        self.db = Chroma(
            persist_directory=settings.CHROMA_DIR,
            embedding_function=embedder.model
        )
        logger.info("VectorDB initialized", extra={
            "dir": settings.CHROMA_DIR,
            "count": self.get_collection_count(),
        })
    
    def add_documents(self, docs: List[Document]) -> int:
        self.db.add_documents(docs)
        logger.info("Documents indexed", extra={"count": len(docs)})
        return len(docs)

    def similarity_search(self, query: str, k: int = 4, filter: dict = None) -> List[Document]:
        return self.db.similarity_search(query, k=k, filter=filter)

    def similarity_search_with_score(self, query: str, k: int = 4, filter: dict = None):
        results = self.db.similarity_search_with_relevance_scores(query, k=k, filter=filter)
        logger.debug("Search executed", extra={
            "query": query[:50], "k": k, "filter": filter, "results": len(results)
        })
        return results

    def delete_by_file(self, user_id: str, file_name: str):
        try:
            self.db._collection.delete(where={"$and": [{"user_id": {"$eq": user_id}}, {"file_name": {"$eq": file_name}}]})
            logger.info("Documents deleted from Chroma", extra={"user_id": user_id, "file": file_name})
        except Exception as e:
            logger.error("Failed to delete from vector db", extra={"error": str(e)})

    def get_collection_count(self) -> int:
        return self.db._collection.count()
    
# Singleton
vector_db = VectorDBService()
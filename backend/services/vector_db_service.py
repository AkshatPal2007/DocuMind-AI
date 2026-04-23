from langchain_community.vectorstores import Chroma
from ml.embeddings.embedder import embedder
from langchain_core.documents import Document
from typing import List
import os

CHROMA_DIR = "data/chroma_db"


class VectorDBService:
    def __init__(self):
        self.db = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=embedder.model
        )
    
    def add_documents(self, docs: List[Document]) -> int:
        self.db.add_documents(docs)
        return len(docs)

    def similarity_search(self, query: str, k: int = 4, filter: dict = None) -> List[Document]:
        return self.db.similarity_search(query, k=k, filter=filter)

    def similarity_search_with_score(self, query: str, k: int = 4, filter: dict = None):
        return self.db.similarity_search_with_relevance_scores(query, k=k, filter=filter)

    def get_collection_count(self) -> int:
        return self.db._collection.count()
    
# Singleton
vector_db = VectorDBService()
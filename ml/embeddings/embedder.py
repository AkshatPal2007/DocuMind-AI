from langchain_huggingface import HuggingFaceEmbeddings
from typing import List
from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)


class Embedder:
    def __init__(self):
        logger.info("Loading embedding model", extra={
            "model": settings.EMBEDDING_MODEL, "device": settings.EMBEDDING_DEVICE
        })
        self.model = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={"device": settings.EMBEDDING_DEVICE},
            encode_kwargs={"normalize_embeddings": True}
        )
        logger.info("Embedding model loaded")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return self.model.embed_documents(texts)

    def embed_query(self, query: str) -> List[float]:
        return self.model.embed_query(query)

# Singleton — import this everywhere
embedder = Embedder()
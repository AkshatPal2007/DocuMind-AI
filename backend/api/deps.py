# backend/api/deps.py
"""
FastAPI Dependency Injection — provides shared resources to route handlers.

Usage in routes:
    from backend.api.deps import get_vector_db, get_settings

    @router.post("/upload")
    async def upload(settings: Settings = Depends(get_settings)):
        ...
"""

from backend.core.config import Settings, settings
from backend.services.vector_db_service import VectorDBService, vector_db
from backend.core.logger import get_logger

logger = get_logger(__name__)


def get_settings() -> Settings:
    """Inject the global settings object."""
    return settings


def get_vector_db() -> VectorDBService:
    """Inject the vector database service."""
    return vector_db


def get_upload_dir() -> str:
    """Inject the upload directory path."""
    return settings.UPLOAD_DIR

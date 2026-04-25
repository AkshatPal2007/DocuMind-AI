# backend/api/deps.py
"""
FastAPI Dependency Injection — provides shared resources to route handlers.

Usage in routes:
    from backend.api.deps import get_vector_db, get_settings

    @router.post("/upload")
    async def upload(settings: Settings = Depends(get_settings)):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from backend.core.config import Settings, settings
from backend.services.vector_db_service import VectorDBService, vector_db
from backend.core.logger import get_logger

logger = get_logger(__name__)
security = HTTPBearer()

def get_settings() -> Settings:
    """Inject the global settings object."""
    return settings


def get_vector_db() -> VectorDBService:
    """Inject the vector database service."""
    return vector_db


def get_upload_dir() -> str:
    """Inject the upload directory path."""
    return settings.UPLOAD_DIR

from backend.services.db_service import db_service

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Verify Supabase JWT token and return user ID."""
    token = credentials.credentials
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.warning("Supabase configuration missing on server.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auth configuration missing on server."
        )
    
    try:
        # Use the Supabase client to verify the token securely online
        res = db_service.supabase.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return res.user.id
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

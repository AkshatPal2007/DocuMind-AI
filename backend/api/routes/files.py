from fastapi import APIRouter, Depends
from backend.services.db_service import db_service
from backend.api.deps import get_current_user
from backend.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/files")
async def list_files(user_id: str = Depends(get_current_user)):
    """List all documents uploaded by the user."""
    try:
        files = db_service.get_user_files(user_id)
        return {"files": files}
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return {"files": []}

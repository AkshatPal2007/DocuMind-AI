from fastapi import APIRouter, Depends, HTTPException
import os
from backend.services.db_service import db_service
from backend.services.vector_db_service import vector_db
from backend.api.deps import get_current_user, get_upload_dir
from backend.core.logger import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/files")
async def list_files(
    user_id: str = Depends(get_current_user),
    upload_dir: str = Depends(get_upload_dir)
):
    """List all documents uploaded by the user, crosschecking with physical files."""
    try:
        db_files = db_service.get_user_files(user_id)
        valid_files = []
        
        for file_record in db_files:
            file_name = file_record.get("file_name")
            file_path = os.path.join(upload_dir, file_name)
            
            if os.path.exists(file_path):
                valid_files.append(file_record)
            else:
                # Crosscheck failed: file was manually deleted from disk.
                # Clean up the stale records from DB and Vector DB automatically.
                logger.info("Stale file detected, cleaning up", extra={"file": file_name})
                try:
                    vector_db.delete_by_file(user_id, file_name)
                    db_service.delete_file(user_id, file_name)
                except Exception as cleanup_err:
                    logger.error("Error during stale file cleanup", extra={"error": str(cleanup_err)})
                    
        return {"files": valid_files}
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return {"files": []}

@router.delete("/files/{file_name}")
async def delete_file(
    file_name: str, 
    user_id: str = Depends(get_current_user),
    upload_dir: str = Depends(get_upload_dir)
):
    """Delete a document from DB, Vector DB, and local disk."""
    try:
        # Delete from Vector DB
        vector_db.delete_by_file(user_id, file_name)
        
        # Delete from Postgres
        db_service.delete_file(user_id, file_name)
        
        # Delete from local disk
        file_path = os.path.join(upload_dir, file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info("File deleted from disk", extra={"file": file_path})
            
        return {"message": "File deleted successfully"}
    except Exception as e:
        logger.error("Error deleting file", extra={"file": file_name, "error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))

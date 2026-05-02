# backend/api/routes/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from backend.agents.ingestion_agent import IngestionAgent
from backend.api.deps import get_upload_dir, get_current_user
from backend.core.logger import get_logger
import shutil, os

router = APIRouter()
logger = get_logger(__name__)


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    upload_dir: str = Depends(get_upload_dir),
    user_id: str = Depends(get_current_user),
):
    allowed = [".pdf", ".txt", ".docx", ".csv"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="File type not supported")
    
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.info("File uploaded", extra={"file": file.filename, "size": file.size, "path": file_path, "user_id": user_id})

    # Trigger ingestion
    try:
        agent = IngestionAgent()
        result = agent.run(file_path, user_id=user_id)
        logger.info("Ingestion complete", extra={
            "file": file.filename, "chunks": result["chunks"], "total": result["total_indexed"]
        })
        return {"message": "Uploaded & ingested", "chunks": result["chunks"]}
    except ValueError as e:
        logger.error("Ingestion failed (validation)", extra={"file": file.filename, "error": str(e)})
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Ingestion failed", extra={"file": file.filename, "error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))
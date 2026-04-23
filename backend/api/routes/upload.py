# backend/api/routes/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.services.ingestion import ingest_document
import shutil, os

router = APIRouter()

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed = [".pdf", ".txt", ".docx", ".csv"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="File type not supported")
    
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Trigger ingestion
    try:
        result = ingest_document(file_path)
        return {"message": "Uploaded & ingested", "chunks": result["chunks"]}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# backend/main.py
"""
DocuMind API — FastAPI entry point.
"""

from backend.core.config import settings
from backend.core.logger import get_logger

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import upload, chat, query, files

logger = get_logger(__name__)

app = FastAPI(title="DocuMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(chat.router,   prefix="/api")
app.include_router(query.router,  prefix="/api")
app.include_router(files.router,  prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info("DocuMind API started", extra={
        "cors": settings.CORS_ORIGINS,
        "chroma": settings.CHROMA_DIR,
        "uploads": settings.UPLOAD_DIR,
    })


@app.get("/")
def root():
    return {"message": "DocuMind API running"}
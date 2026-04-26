# backend/core/config.py
"""
Centralized configuration — single source of truth for all settings.

Instead of scattering os.getenv() and hardcoded paths everywhere,
every module imports `settings` from here.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Project Root ─────────────────────────────────────────────────────────
# Resolve project root (2 levels up from this file: backend/core/config.py → project root)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings:
    """Application settings loaded from environment + sensible defaults."""

    # ── Directories ──────────────────────────────────────────────────────
    UPLOAD_DIR: str = str(PROJECT_ROOT / "data" / "uploads")
    CHROMA_DIR: str = str(PROJECT_ROOT / "data" / "chroma_db")
    RAW_DIR: str = str(PROJECT_ROOT / "data" / "raw")
    PROCESSED_DIR: str = str(PROJECT_ROOT / "data" / "processed")
    EMBEDDINGS_DIR: str = str(PROJECT_ROOT / "data" / "embeddings")
    EVAL_DIR: str = str(PROJECT_ROOT / "data" / "eval")

    # ── API Keys ─────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # ── Supabase ─────────────────────────────────────────────────────────
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # ── Embedding Model ──────────────────────────────────────────────────
    EMBEDDING_MODEL: str = os.getenv(
        "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
    )
    EMBEDDING_DEVICE: str = os.getenv("EMBEDDING_DEVICE", "cpu")

    # ── Chunking Defaults ────────────────────────────────────────────────
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # ── Retrieval Defaults ───────────────────────────────────────────────
    DEFAULT_K: int = int(os.getenv("DEFAULT_K", "6"))

    # ── LLM Defaults ────────────────────────────────────────────────────
    DEFAULT_MODEL_ID: str = os.getenv(
        "DEFAULT_MODEL_ID", "nvidia/meta/llama-3.3-70b-instruct"
    )

    # ── Server ───────────────────────────────────────────────────────────
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "https://documind-weld.vercel.app",
        "https://80e0-160-202-36-121.ngrok-free.app",
    ]

    # ── Pipeline ─────────────────────────────────────────────────────────
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "2"))

    def __init__(self):
        """Ensure all data directories exist on startup."""
        for d in [
            self.UPLOAD_DIR,
            self.CHROMA_DIR,
            self.RAW_DIR,
            self.PROCESSED_DIR,
            self.EMBEDDINGS_DIR,
            self.EVAL_DIR,
        ]:
            os.makedirs(d, exist_ok=True)


# ── Singleton ────────────────────────────────────────────────────────────
settings = Settings()

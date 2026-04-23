# backend/core/logger.py
"""
Structured logging for DocuMind.

Usage:
    from backend.core.logger import get_logger
    logger = get_logger(__name__)
    logger.info("Document ingested", extra={"file": "paper.pdf", "chunks": 12})
"""

import logging
import sys
from pathlib import Path


# ── Custom Formatter ─────────────────────────────────────────────────────

class DocuMindFormatter(logging.Formatter):
    """
    Clean, structured log format:
      [HH:MM:SS] LEVEL    module_name  │ message
    """
    COLORS = {
        "DEBUG":    "\033[36m",    # cyan
        "INFO":     "\033[32m",    # green
        "WARNING":  "\033[33m",    # yellow
        "ERROR":    "\033[31m",    # red
        "CRITICAL": "\033[1;31m",  # bold red
    }
    RESET = "\033[0m"

    def format(self, record):
        # Shorten module path: backend.agents.reasoning_agent → reasoning_agent
        module = record.name.split(".")[-1] if "." in record.name else record.name

        color = self.COLORS.get(record.levelname, "")
        reset = self.RESET

        # Base message
        timestamp = self.formatTime(record, "%H:%M:%S")
        prefix = f"{color}[{timestamp}] {record.levelname:<8}{reset} {module:<22} │ "
        msg = f"{prefix}{record.getMessage()}"

        # Append structured extra fields if present
        extras = {
            k: v for k, v in record.__dict__.items()
            if k not in logging.LogRecord(
                "", 0, "", 0, "", (), None
            ).__dict__ and k not in ("message", "msg", "args")
        }
        if extras:
            pairs = " ".join(f"{k}={v}" for k, v in extras.items())
            msg += f"  ({pairs})"

        # Append exception info
        if record.exc_info and not record.exc_text:
            record.exc_text = self.formatException(record.exc_info)
        if record.exc_text:
            msg += f"\n{record.exc_text}"

        return msg


# ── Logger Factory ───────────────────────────────────────────────────────

_configured = False


def _setup_root():
    """Configure root logger once."""
    global _configured
    if _configured:
        return
    _configured = True

    root = logging.getLogger("documind")
    root.setLevel(logging.DEBUG)

    # Console handler
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(logging.INFO)
    console.setFormatter(DocuMindFormatter())
    root.addHandler(console)

    # Quiet noisy libraries
    for lib in ["httpcore", "httpx", "chromadb", "urllib3", "openai", "google"]:
        logging.getLogger(lib).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a named logger under the 'documind' namespace.

    Usage:
        logger = get_logger(__name__)
        logger.info("Hello")
    """
    _setup_root()
    return logging.getLogger(f"documind.{name}")

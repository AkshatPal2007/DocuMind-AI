from supabase import create_client, Client
from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

class DBService:
    def __init__(self):
        self.supabase: Client | None = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            logger.info("Supabase DB client initialized.")
        else:
            logger.warning("Supabase configuration missing. DB tracking disabled.")

    def add_file(self, user_id: str, file_name: str, file_path: str, pages: int, chunks: int):
        """Record an uploaded file in the database."""
        if not self.supabase:
            return None
        
        try:
            data = {
                "user_id": user_id,
                "file_name": file_name,
                "file_path": file_path,
                "pages": pages,
                "chunks": chunks
            }
            res = self.supabase.table("files").insert(data).execute()
            logger.info("File record created in Postgres", extra={"file": file_name})
            return res.data
        except Exception as e:
            logger.error("Failed to insert file record", extra={"error": str(e)})
            raise

    def get_user_files(self, user_id: str):
        """Retrieve all file records for a given user."""
        if not self.supabase:
            return []
        
        try:
            res = self.supabase.table("files").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return res.data
        except Exception as e:
            logger.error("Failed to retrieve file records", extra={"error": str(e)})
            return []

db_service = DBService()

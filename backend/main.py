from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.routes import upload, chat, query   # add query

app = FastAPI(title="DocuMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api")
app.include_router(chat.router,   prefix="/api")
app.include_router(query.router,  prefix="/api")   # add this

@app.get("/")
def root():
    return {"message": "DocuMind API running"}
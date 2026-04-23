# backend/services/retriever.py
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

CHROMA_DIR = "data/chroma_db"

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def retriever_context(query: str, k: int = 4) -> str:
    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )
    docs = vectorstore.similarity_search(query, k=k)
    
    # Return context with source citations
    context_parts = []
    for i, doc in enumerate(docs):
        source = doc.metadata.get("source", "Unknown")
        context_parts.append(f"[Source {i+1}: {source}]\n{doc.page_content}")
    
    return "\n\n".join(context_parts)
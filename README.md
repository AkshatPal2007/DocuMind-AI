# 🧠 DocuMind

**DocuMind** is an advanced, multi-agent Retrieval-Augmented Generation (RAG) system that allows you to "interrogate" your documents. Built with a modern tech stack, it uses specialized AI agents (Retrieval, Reasoning, Critique, and Summarization) orchestrated via LangGraph to provide highly accurate, grounded answers from your PDFs.

![DocuMind UI Demo](https://via.placeholder.com/1000x500.png?text=DocuMind+Interface)

## 🚀 Features

- **Multi-Agent Architecture**: Uses `LangGraph` to route queries through a specialized pipeline:
  1. **Retrieval Agent**: Extracts semantic chunks using `ChromaDB` and HuggingFace embeddings.
  2. **Reasoning Agent**: Synthesizes the raw context into an initial answer.
  3. **Critique Agent**: Fact-checks the answer against the source documents. If it detects hallucinations, it forces a deterministic query-rewrite and retries the pipeline.
  4. **Summary Agent**: Polishes the final grounded answer and preserves citations.
- **Multi-Provider LLM Support**: Dynamically switch between **NVIDIA NIM** (Llama 3, DeepSeek-V3), **Google Gemini** (2.5 Flash), and **Groq** (Llama 3 8B/70B) at runtime.
- **Smart Routing**: Automatically routes simple JSON tasks (like the Critique agent) to the fastest available model (e.g., Groq 8B) to keep the pipeline extremely snappy.
- **Document Scoping**: Chat with your entire knowledge base, or filter the vector search down to a specific uploaded document.
- **Modern UI**: A sleek, dark-mode React frontend built with Vite and Tailwind CSS, featuring real-time "Agent Telemetry" so you can watch the agents "think".
- **Containerized Ready**: Fully dockerized backend and frontend (with Nginx) via `docker-compose`.

---

## 🛠️ Technology Stack

- **Backend**: Python 3.11, FastAPI, LangGraph, LangChain
- **Frontend**: React 19, Vite, Tailwind CSS
- **Vector Database**: ChromaDB (Local SQLite persistence)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (HuggingFace)
- **Infrastructure**: Docker, Nginx

---

## 📦 Getting Started (Docker - Recommended)

The easiest way to run DocuMind is using Docker. This spins up the FastAPI backend, the React frontend, and the Nginx proxy all at once.

### 1. Clone the repository
```bash
git clone https://github.com/AkshatPal2007/DocuMind-AI.git
cd DocuMind-AI
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your API keys:
```env
# Add the keys for the providers you want to use.
# DocuMind will automatically detect available models based on these keys.
GEMINI_API_KEY=your_gemini_key_here
NVIDIA_API_KEY=your_nvidia_nim_key_here
GROQ_API_KEY=your_groq_key_here

# Optional Configurations
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
DEFAULT_K=6
```

### 3. Build and Run
```bash
docker-compose up -d --build
```

### 4. Access the App
Open your browser and navigate to: **http://localhost**
*(The API will be available at `http://localhost/api`)*

---

## 💻 Local Development Setup

If you prefer to run the services manually without Docker:

### Backend Setup
1. Create a virtual environment and install dependencies:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
2. Start the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload
   ```
   *The backend will run on `http://localhost:8000`.*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## 📂 Project Structure

```text
DocuMind/
├── backend/
│   ├── agents/          # Specialized LangGraph agents (Reasoning, Critique, etc.)
│   ├── api/             # FastAPI routes and dependency injection
│   ├── core/            # Centralized config and structured logging
│   ├── orchestrator/    # LangGraph state machine (langgraph_flow.py)
│   ├── schemas/         # Pydantic models for request/response validation
│   ├── services/        # Business logic (LLM routing, VectorDB wrappers, Ingestion)
│   └── utils/           # Helper scripts (PDF parsing, intelligent chunking)
├── frontend/
│   ├── src/             # React source code (Components, Pages, API Client)
│   └── package.json
├── infra/
│   ├── docker/          # Multi-stage Dockerfiles
│   └── nginx/           # Reverse proxy configuration
├── ml/                  # Machine learning configurations (Embeddings, Hybrid Search)
├── data/                # Persistent volumes for ChromaDB and file uploads
├── docker-compose.yml
└── requirements.txt
```

---


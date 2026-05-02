# backend/services/llm_provider.py
"""
Unified LLM Provider — routes requests to Gemini, NVIDIA, or Groq
based on a model identifier string.

Model format: "provider/model-name"
  e.g. "gemini/gemini-2.5-flash", "nvidia/meta/llama-3.3-70b-instruct", "groq/llama-3.1-8b-instant"
"""

from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)

# ── Available Models Registry ────────────────────────────────────────────

AVAILABLE_MODELS = [
    {
        "id": "gemini/gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "provider": "gemini",
        "model": "gemini-2.5-flash",
        "env_key": "GEMINI_API_KEY",
    },
    {
        "id": "nvidia/meta/llama-3.3-70b-instruct",
        "name": "Llama 3.3 70B (NVIDIA)",
        "provider": "nvidia",
        "model": "meta/llama-3.3-70b-instruct",
        "env_key": "NVIDIA_API_KEY",
    },
    {
        "id": "nvidia/meta/llama-3.1-8b-instruct",
        "name": "Llama 3.1 8B (NVIDIA)",
        "provider": "nvidia",
        "model": "meta/llama-3.1-8b-instruct",
        "env_key": "NVIDIA_API_KEY",
    },
    {
        "id": "nvidia/minimaxai/minimax-m2.7",
        "name": "MiniMax m2.7 (NVIDIA)",
        "provider": "nvidia",
        "model": "minimaxai/minimax-m2.7",
        "env_key": "NVIDIA_API_KEY",
    },
    {
        "id": "groq/llama-3.1-8b-instant",
        "name": "Llama 3.1 8B (Groq)",
        "provider": "groq",
        "model": "llama-3.1-8b-instant",
        "env_key": "GROQ_API_KEY",
    },
    {
        "id": "groq/llama-3.3-70b-versatile",
        "name": "Llama 3.3 70B (Groq)",
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "env_key": "GROQ_API_KEY",
    },
]

DEFAULT_MODEL_ID = settings.DEFAULT_MODEL_ID


def get_available_models() -> list:
    """Return models that have a valid API key configured."""
    available = []
    for m in AVAILABLE_MODELS:
        key = getattr(settings, m["env_key"], "")
        if key:
            available.append({
                "id": m["id"],
                "name": m["name"],
                "provider": m["provider"],
            })
    return available


def get_fast_model() -> str:
    """Return the fastest available model ID, ideal for quick JSON tasks like critique."""
    available = [m["id"] for m in get_available_models()]
    
    # 1. Prefer Groq 8B for absolute fastest JSON schema generation
    for m in available:
        if "groq" in m and "8b" in m: return m
        
    # 2. Fallback to Gemini Flash
    for m in available:
        if "gemini" in m and "flash" in m: return m
        
    # 3. Fallback to NVIDIA 8B
    for m in available:
        if "nvidia" in m and "8b" in m: return m
        
    return DEFAULT_MODEL_ID


def _resolve_model(model_id: str) -> dict:
    """Resolve a model ID string to its config."""
    for m in AVAILABLE_MODELS:
        if m["id"] == model_id:
            return m
    raise ValueError(f"Unknown model: {model_id}")


# ── Provider Clients (lazy-initialized) ─────────────────────────────────

_clients = {}


def _get_gemini_client():
    if "gemini" not in _clients:
        from google import genai
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set")
        logger.info("Gemini client initialized")
        _clients["gemini"] = genai.Client(api_key=api_key)
    return _clients["gemini"]


def _get_nvidia_client():
    if "nvidia" not in _clients:
        from openai import OpenAI
        api_key = settings.NVIDIA_API_KEY
        if not api_key:
            raise RuntimeError("NVIDIA_API_KEY not set")
        logger.info("NVIDIA client initialized")
        _clients["nvidia"] = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
        )
    return _clients["nvidia"]


def _get_groq_client():
    if "groq" not in _clients:
        from groq import Groq
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        logger.info("Groq client initialized")
        _clients["groq"] = Groq(api_key=api_key)
    return _clients["groq"]


# ── Unified Generation ──────────────────────────────────────────────────

def generate(
    system_prompt: str,
    user_prompt: str,
    model_id: str = None,
    json_mode: bool = False,
    temperature: float = None,
) -> str:
    """
    Generate text using the specified model.
    Falls back to DEFAULT_MODEL_ID if model_id is None.
    Returns the generated text string.
    """
    model_id = model_id or DEFAULT_MODEL_ID
    config = _resolve_model(model_id)
    provider = config["provider"]
    model_name = config["model"]

    logger.info("LLM generate", extra={"provider": provider, "model": model_name, "temperature": temperature})

    if provider == "gemini":
        return _generate_gemini(system_prompt, user_prompt, model_name, json_mode, temperature)
    elif provider == "nvidia":
        return _generate_openai_compat(_get_nvidia_client(), system_prompt, user_prompt, model_name, json_mode, temperature)
    elif provider == "groq":
        return _generate_openai_compat(_get_groq_client(), system_prompt, user_prompt, model_name, json_mode, temperature)
    else:
        raise ValueError(f"Unknown provider: {provider}")


def _generate_gemini(system_prompt, user_prompt, model_name, json_mode, temperature):
    from google import genai
    client = _get_gemini_client()

    config_kwargs = {"system_instruction": system_prompt}
    if temperature is not None:
        config_kwargs["temperature"] = temperature
    if json_mode:
        config_kwargs["response_mime_type"] = "application/json"

    response = client.models.generate_content(
        model=model_name,
        contents=user_prompt,
        config=genai.types.GenerateContentConfig(**config_kwargs),
    )
    return response.text


def _generate_openai_compat(client, system_prompt, user_prompt, model_name, json_mode, temperature):
    kwargs = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    if temperature is not None:
        kwargs["temperature"] = temperature
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = client.chat.completions.create(**kwargs)
    return response.choices[0].message.content

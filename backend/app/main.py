from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import os, json, pathlib, re

# flake8: noqa
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

FRONTEND_DIR = pathlib.Path(__file__).parent.parent.parent / "frontend"

MODELS = {
    "global": "CohereLabs/tiny-aya-global",
    "earth": "CohereLabs/tiny-aya-earth",
    "fire": "CohereLabs/tiny-aya-fire",
    "water": "CohereLabs/tiny-aya-water",
}


def get_token(request: Request) -> str:
    return request.headers.get("X-HF-Token") or os.environ.get("HF_TOKEN", "")


class TranslateRequest(BaseModel):
    text: str
    model_key: str = "global"
    target_lang: str = "English"


def _detect_language(client: InferenceClient, text: str) -> tuple[str, str]:
    """Returns (language_name, language_code). Falls back to ('Unknown', 'und')."""
    try:
        response = client.chat_completion(
            messages=[
                {
                    "role": "user",
                    "content": (
                        f'What language is this text: "{text}"\n'
                        "Reply with ONLY a JSON object, nothing else:\n"
                        '{"language_name": "French", "language_code": "fr"}'
                    ),
                }
            ],
            max_tokens=64,
            temperature=0.1,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        detected = json.loads(raw.strip())
        return detected.get("language_name", "Unknown"), detected.get(
            "language_code", "und"
        )
    except Exception:
        return "Unknown", "und"


def _translate(client: InferenceClient, text: str, target_lang: str) -> str:
    response = client.chat_completion(
        messages=[
            {
                "role": "user",
                "content": (
                    f"Translate this text to {target_lang}.\n"
                    f"Text: {text}\n"
                    f"{target_lang} translation:"
                ),
            }
        ],
        max_tokens=512,
        temperature=0.1,
    )
    translation = response.choices[0].message.content.strip()

    # Strip echoed prefixes
    for prefix in [
        f"{target_lang} translation:",
        f"{target_lang}:",
        "Translation:",
        "Answer:",
    ]:
        if translation.lower().startswith(prefix.lower()):
            translation = translation[len(prefix) :].strip()

    # Strip verbose wrapper e.g. 'The English translation of "X" is: "Y"'
    wrapped = re.search(r'(?:is:|is)\s*["\u201c](.+?)["\u201d]', translation)
    if wrapped:
        translation = wrapped.group(1).strip()

    # If model gives options like "X" or "Y", take the first
    if '" or "' in translation:
        translation = translation.split('" or "')[0].strip('"').strip()

    return translation


@app.get("/health")
def health():
    return {"status": "ok", "models": list(MODELS.keys())}


@app.post("/translate")
def translate(req: TranslateRequest, request: Request):
    """Worker (English) → resident's language."""
    token = get_token(request)
    if not token:
        raise HTTPException(
            status_code=401, detail="No HuggingFace token. Add it in Settings."
        )

    model_id = MODELS.get(req.model_key, MODELS["global"])
    client = InferenceClient(model=model_id, token=token)

    try:
        translation = _translate(client, req.text, req.target_lang)
        return {"translation": translation, "model_used": model_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-and-translate")
def detect_and_translate(req: TranslateRequest, request: Request):
    """Resident (unknown language) → detect language, then translate to English."""
    token = get_token(request)
    if not token:
        raise HTTPException(
            status_code=401, detail="No HuggingFace token. Add it in Settings."
        )

    model_id = MODELS.get(req.model_key, MODELS["global"])
    client = InferenceClient(model=model_id, token=token)

    language_name, language_code = _detect_language(client, req.text)

    try:
        translation = _translate(client, req.text, "English")
        return {
            "detected_language": language_name,
            "detected_language_code": language_code,
            "translation": translation,
            "model_used": model_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Serve frontend — must be last
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

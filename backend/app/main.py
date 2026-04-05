from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os, json, pathlib, re, tempfile

# flake8: noqa
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

FRONTEND_DIR = pathlib.Path(__file__).parent.parent.parent / "frontend"
BACKEND_DIR = pathlib.Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env (if present)
load_dotenv(BACKEND_DIR / ".env")

_whisper_model = None


def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        import whisper

        print("Loading Whisper small...")
        _whisper_model = whisper.load_model("small")
        print("Whisper ready.")
    return _whisper_model


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
                    f"Translate the following text to {target_lang}. "
                    f"Respond with ONLY the {target_lang} translation and nothing else.\n\n"
                    f'"{text}"'
                ),
            },
            {
                "role": "assistant",
                "content": f"{target_lang}:",
            },
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

    # Strip wrapping quotes the model may add (ASCII and CJK)
    translation = translation.strip('""\u201c\u201d\u300c\u300d')

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


@app.post("/detect-language")
async def detect_language(audio: UploadFile = File(...)):
    """Accept audio, run Whisper, return detected language."""
    suffix = pathlib.Path(audio.filename or "audio.webm").suffix or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        model = _get_whisper()
        result = model.transcribe(tmp_path)
        detected_code = result.get("language", "und")

        from whisper.tokenizer import LANGUAGES

        detected_name = LANGUAGES.get(detected_code, "Unknown").title()

        return {
            "detected_language_code": detected_code,
            "detected_language_name": detected_name,
            "transcript": result.get("text", "").strip(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# Serve frontend — must be last
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

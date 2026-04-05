from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import whisper
import tempfile
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"Using device: {DEVICE}")

# African language codes Whisper returns
AFRICAN_LANGS = {"so", "ti", "om", "am"}

# Load Whisper
print("Loading Whisper small...")
whisper_model = whisper.load_model("small")
print("Whisper ready.")

# Load Aya Global
print("Loading Aya Global...")
global_tokenizer = AutoTokenizer.from_pretrained("CohereLabs/tiny-aya-global")
global_model = AutoModelForCausalLM.from_pretrained(
    "CohereLabs/tiny-aya-global",
    torch_dtype=torch.float16
).to(DEVICE)
print("Aya Global ready.")

# Load Aya Earth
print("Loading Aya Earth...")
earth_tokenizer = AutoTokenizer.from_pretrained("CohereLabs/tiny-aya-earth")
earth_model = AutoModelForCausalLM.from_pretrained(
    "CohereLabs/tiny-aya-earth",
    torch_dtype=torch.float16
).to(DEVICE)
print("Aya Earth ready.")

def get_model(lang_code):
    if lang_code in AFRICAN_LANGS:
        return earth_model, earth_tokenizer
    return global_model, global_tokenizer

def translate(transcript, detected_lang, target_lang):
    model, tokenizer = get_model(detected_lang)

    prompt = f"""You are a compassionate translator in a women's shelter.
Translate the following text to {target_lang}.
Keep the tone warm, simple, and clear.
Respond with only the translation, nothing else.

Text: {transcript}
Translation:"""

    inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
    
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=200,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id
        )
    
    full = tokenizer.decode(outputs[0], skip_special_tokens=True)
    translation = full.split("Translation:")[-1].strip()
    return translation

@app.post("/process")
async def process(
    audio: UploadFile = File(...),
    target_lang: str = "English"
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        # Whisper: audio → transcript + language
        result = whisper_model.transcribe(tmp_path)
        transcript = result["text"].strip()
        detected_lang = result["language"]

        # Aya: transcript → translation
        translation = translate(transcript, detected_lang, target_lang)

        return {
            "detected_language": detected_lang,
            "transcript": transcript,
            "translation": translation
        }

    finally:
        os.unlink(tmp_path)

# Serve frontend from /static folder
app.mount("/", StaticFiles(directory="static", html=True), name="static")
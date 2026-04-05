## Backend

The FastAPI backend lives in [backend/](backend/).

Use [backend/backend.sh](backend/backend.sh) to set up the backend environment, install dependencies, and load backend/.env before running uvicorn.

### Prerequisites

- **Python 3.11+**
- **ffmpeg** — required by Whisper for audio processing
  ```bash
  # macOS
  brew install ffmpeg
  # Linux
  sudo apt install ffmpeg
  ```

## Manual setup

If `backend.sh` does not work, do it manually:

1. Open a terminal in the backend folder.
2. Create and activate a Python 3.11 virtual environment:
   ```bash
   python3.11 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `backend/.env` and add your Hugging Face token:
   ```env
   HF_TOKEN=your_huggingface_token_here
   ```
5. Start the backend:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/translate` | POST | Translate text to a target language |
| `/detect-and-translate` | POST | Detect source language and translate to English |
| `/detect-language` | POST | Accept audio file, detect language via Whisper (used during initialization) |

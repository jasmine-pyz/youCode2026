## Backend

The FastAPI backend lives in [backend/](backend/).

Use [backend/backend.sh](backend/backend.sh) to set up the backend environment, install dependencies, and load backend/.env before running uvicorn.

## Manual setup

If `backend.sh` does not work, do it manually:

**1. Set up environment variables**

Create `backend/.env` and add your Hugging Face token.
```bash
HF_TOKEN=your_huggingface_token_here
```

**2. Set up the backend environment**

Create and activate a Python virtual environment.
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Start the backend**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

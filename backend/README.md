# Backend Setup (FastAPI)

This backend serves translation endpoints and expects a Hugging Face token.

## 1) Go to backend folder

```bash
cd backend
```

## 2) Create and activate virtual environment

If you already have `youCodeVenv`, just activate it.

```bash
python3 -m venv youCodeVenv
source youCodeVenv/bin/activate
```

## 3) Install dependencies

```bash
pip install -r requirements.txt
```

## 4) Add environment variables

Create a `.env` file in `backend/` with:

```env
HF_TOKEN=your_huggingface_token_here
```

The API now loads `backend/.env` automatically at startup.

## 5) Run the backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 6) Verify it works

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Expected: JSON with `status: "ok"` and available models.

## API Endpoints

- `POST /translate`
- `POST /detect-and-translate`
- `GET /health`

## Common Issues

- `401 No HuggingFace token`:

  - Confirm `.env` exists under `backend/.env`
  - Confirm `HF_TOKEN` is set correctly
  - Restart `uvicorn` after changing `.env`

- `405 Method Not Allowed`:
  - Use `POST` for translation endpoints (`/translate`, `/detect-and-translate`)
  - `GET` is only supported on `/health`

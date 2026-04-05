# youCode2026

## Running Locally

### Prerequisites

- Python 3.9+
- Node.js 18+
- ffmpeg (`brew install ffmpeg`)

### First-Time Setup

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### After Pulling Latest Main

```bash
git pull origin main

# Backend — install any new dependencies
cd backend
source .venv/bin/activate
pip install -r requirements.txt

# Frontend — install any new dependencies
cd ../frontend
npm install
```

Then restart both servers as usual.

### Testing on a Physical Device (iOS)

iOS Safari requires HTTPS for microphone access. Use ngrok to create a secure tunnel:

1. Install ngrok: `brew install ngrok`
2. Sign up at [ngrok.com](https://ngrok.com) and run `ngrok config add-authtoken YOUR_TOKEN`
3. Start tunnels: `ngrok start --all --config ~/ngrok-hearth.yml`
4. Create `frontend/.env.local`:
   `NEXT_PUBLIC_BACKEND_URL=https://your-backend-tunnel.ngrok-free.app`

5. Open the frontend tunnel URL on your iPhone

> **Android users:** No ngrok needed — open `http://YOUR_LOCAL_IP:3000` directly.

# Hearth Backend

## Requirements
- Python 3.9 or later
- ffmpeg (required by Whisper for audio processing)
- See `requirements.txt` for full dependencies.

## Setup

Alternatively, run [`backend.sh`](backend.sh) to automate steps 2–4 below: it creates and activates the virtual environment, installs dependencies, and loads `.env` before starting the server.

**1. Clone the Repository**

This downloads a copy of the project to your computer and moves you into the backend folder.
```bash
git clone https://github.com/steph-xue/hearth.git
cd hearth/backend
```

**2. Create and Activate a Python Virtual Environment**

This keeps the project's dependencies separate from other Python projects on your machine.
```bash
python3 -m venv .venv       # On Windows use: python -m venv .venv
source .venv/bin/activate   # On Windows use: .venv\Scripts\activate
```

**3. Install the Dependencies**

This installs all dependencies the backend needs to run.
```bash
pip install -r requirements.txt
```

**4. Set Up Environment Variables**

Create a `.env` file in the backend folder with your Hugging Face token.
```bash
HF_TOKEN=your_huggingface_token_here  # Hugging Face token
```

**5. Start the Development Server**

This runs the FastAPI backend development server using Uvicorn.
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The server will be available at `http://127.0.0.1:8000`.
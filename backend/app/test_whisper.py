import whisper

print("Loading Whisper small...")
model = whisper.load_model("small")
print("Ready.")

result = model.transcribe("test_cantonese.m4a", language=None, task="transcribe")
print("Transcript:", result["text"])
print("Detected language:", result["language"])
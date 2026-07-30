import whisper

print("Loading Whisper small...")
model = whisper.load_model("small")
print("Ready.")

result = model.transcribe("test.aiff", language=None, task="transcribe")
print("Transcript:", result["text"])
print("Detected language:", result["language"])
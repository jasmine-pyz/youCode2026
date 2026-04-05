import type { SavedTranscript } from "@/types";
import styles from "./TranscriptViewer.module.css";

interface TranscriptViewerProps {
  transcript: SavedTranscript;
  onBack: () => void;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function TranscriptViewer({ transcript, onBack }: TranscriptViewerProps) {
  const sorted = [...transcript.messages].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <h2 className={styles.title}>{transcript.title}</h2>
      </div>

      <div className={styles.messages}>
        {sorted.map((msg) => {
          const isWorker = msg.speaker === "bottom";
          return (
            <div
              key={msg.id}
              className={`${styles.bubble} ${isWorker ? styles.worker : styles.resident}`}
            >
              <div className={styles.role}>
                {isWorker ? "Worker" : "Resident"}
              </div>
              <div className={styles.original}>{msg.originalText}</div>
              <div className={styles.translated}>
                <span className={styles.translatedLabel}>Translation: </span>
                {msg.translatedText}
              </div>
              <div className={styles.meta}>
                <span>{msg.detectedLanguage.code} → {msg.targetLanguage.code}</span>
                <span className={styles.time}>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

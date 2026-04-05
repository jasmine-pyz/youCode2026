import { useState } from "react";
import type { SavedTranscript } from "@/types";
import TranscriptList from "./TranscriptList";
import TranscriptViewer from "./TranscriptViewer";
import styles from "./TranscriptOverlay.module.css";

interface TranscriptOverlayProps {
  transcripts: SavedTranscript[];
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function TranscriptOverlay({ transcripts, onDelete, onClose }: TranscriptOverlayProps) {
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);

  const activeTranscript = activeTranscriptId
    ? transcripts.find((t) => t.id === activeTranscriptId) ?? null
    : null;

  // Fall back to list view if activeTranscriptId is set but no match found
  const showViewer = activeTranscriptId !== null && activeTranscript !== null;

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        <button className={styles.closeBtn} aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.content}>
        {showViewer ? (
          <TranscriptViewer
            transcript={activeTranscript}
            onBack={() => setActiveTranscriptId(null)}
          />
        ) : (
          <TranscriptList
            transcripts={transcripts}
            onSelect={setActiveTranscriptId}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}

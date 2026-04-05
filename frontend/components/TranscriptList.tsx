import type { SavedTranscript } from "@/types";
import styles from "./TranscriptList.module.css";

interface TranscriptListProps {
  transcripts: SavedTranscript[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const date = d.getDate();
  const month = d.toLocaleDateString("en-GB", { month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${day} ${date} ${month}, ${time}`;
}

export default function TranscriptList({ transcripts, onSelect, onDelete }: TranscriptListProps) {
  if (transcripts.length === 0) {
    return (
      <div className={styles.empty}>No saved transcripts yet</div>
    );
  }

  return (
    <ul className={styles.list}>
      {transcripts.map((t) => (
        <li key={t.id} className={styles.row} onClick={() => onSelect(t.id)}>
          <div className={styles.info}>
            <span className={styles.title}>{t.title}</span>
            <span className={styles.meta}>
              {formatDate(t.savedAt)} · {t.messages.length} message{t.messages.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            className={styles.deleteBtn}
            aria-label="Delete transcript"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Delete this transcript?")) {
                onDelete(t.id);
              }
            }}
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}

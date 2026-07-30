"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SaveButton.module.css";

function SaveIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
    </svg>
  );
}

type SaveResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "storage_full" | "unavailable" };

interface SaveButtonProps {
  onSave: () => SaveResult;
  onClear: () => void;
}

type ToastState =
  | { type: "success" }
  | { type: "error"; message: string }
  | null;

export function SaveButton({ onSave, onClear }: SaveButtonProps) {
  const [toast, setToast] = useState<ToastState>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const showToast = (t: ToastState) => {
    clearTimer();
    setToast(t);
    timerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleClick = () => {
    const result = onSave();
    if (result.ok) {
      showToast({ type: "success" });
    } else {
      const messages: Record<string, string> = {
        empty: "Nothing to save yet",
        storage_full: "Storage full — delete old transcripts first",
        unavailable: "Transcripts unavailable on this device",
      };
      showToast({ type: "error", message: messages[result.reason] });
    }
  };

  const handleClear = () => {
    clearTimer();
    setToast(null);
    onClear();
  };

  return (
    <div className={styles.container}>
      <button
        className={`${styles.btn} tooltipEnd`}
        onClick={handleClick}
        aria-label="Save transcript"
        data-tooltip="Save transcript"
      >
        <SaveIcon />
      </button>
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
        >
          {toast.type === "success" ? (
            <>
              <span>Saved</span>
              <button className={styles.clearBtn} onClick={handleClear}>
                Clear &amp; start new
              </button>
            </>
          ) : (
            <span>{toast.message}</span>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./SaveButton.module.css";

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
        className={styles.btn}
        onClick={handleClick}
        aria-label="Save transcript"
      >
        💾
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

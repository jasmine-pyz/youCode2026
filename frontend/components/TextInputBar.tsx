"use client";

import { useState, useRef, useCallback } from "react";
import type { Speaker } from "@/types";
import styles from "./TextInputBar.module.css";

interface TextInputBarProps {
  speaker: Speaker;
  onSubmit: (text: string, speaker: Speaker) => Promise<void>;
  isDisabled?: boolean;
}

export function TextInputBar({ speaker, onSubmit, isDisabled }: TextInputBarProps) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    speaker === "top" ? "Type in any language…" : "Type in English…";

  const handleSubmit = useCallback(async () => {
    const value = text.trim();
    if (!value || isDisabled) return;
    setText("");
    if (taRef.current) {
      taRef.current.style.height = "auto";
    }
    await onSubmit(value, speaker);
  }, [text, isDisabled, onSubmit, speaker]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
  }, []);

  return (
    <div className={styles.bar}>
      <textarea
        ref={taRef}
        className={styles.input}
        value={text}
        placeholder={placeholder}
        rows={1}
        disabled={isDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button
        className={styles.sendBtn}
        onClick={handleSubmit}
        disabled={!text.trim() || isDisabled}
        aria-label="Send"
      >
        ↑
      </button>
    </div>
  );
}

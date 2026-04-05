"use client";

import { useState, useRef, useCallback } from "react";
import { KeyboardIcon } from "./Icons";
import type { Speaker } from "@/types";
import styles from "./TextInputBar.module.css";

interface TextInputBarProps {
  speaker: Speaker;
  onSubmit: (text: string, speaker: Speaker) => Promise<void>;
  isDisabled?: boolean;
}

export function TextInputBar({ speaker, onSubmit, isDisabled }: TextInputBarProps) {
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const placeholder =
    speaker === "top" ? "Type in any language\u2026" : "Type in English\u2026";

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

  if (!visible) {
    return (
      <div className={styles.toggleWrap}>
        <button
          className={styles.toggleBtn}
          onClick={() => setVisible(true)}
          aria-label="Show keyboard input"
        >
          <KeyboardIcon size={18} />
        </button>
      </div>
    );
  }

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
      <button
        className={styles.hideBtn}
        onClick={() => setVisible(false)}
        aria-label="Hide keyboard input"
      >
        ×
      </button>
    </div>
  );
}

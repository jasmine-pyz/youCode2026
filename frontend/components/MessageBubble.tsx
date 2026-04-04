"use client";

import { useCallback } from "react";
import { SpeakerIcon, PlayingIcon } from "./Icons";
import type { TranslationResult, Speaker } from "@/types";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  message: TranslationResult;
  /** Which side is viewing this bubble */
  viewer: Speaker;
  isPlaying: boolean;
  onPlay: (id: string) => void;
}

export function MessageBubble({
  message,
  viewer,
  isPlaying,
  onPlay,
}: MessageBubbleProps) {
  const isMe = message.speaker === viewer;

  const handlePlay = useCallback(() => {
    onPlay(message.id);
  }, [onPlay, message.id]);

  return (
    <div
      className={`${styles.msg} ${isMe ? styles.fromMe : styles.fromOther}`}
    >
      <div className={styles.flag}>{message.detectedLanguage.flag}</div>
      <div className={styles.original}>{message.originalText}</div>
      <div
        className={styles.translation}
        style={{
          paddingRight: !isMe ? 36 : 0,
          paddingLeft: isMe ? 36 : 0,
        }}
      >
        {message.translatedText}
      </div>
      <button
        className={`${styles.playBtn} ${isPlaying ? styles.playing : ""}`}
        onClick={handlePlay}
        aria-label="Play translation aloud"
      >
        {isPlaying ? <PlayingIcon size={14} /> : <SpeakerIcon size={14} />}
      </button>
    </div>
  );
}

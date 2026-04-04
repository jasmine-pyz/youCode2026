"use client";

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { Waveform } from "./Waveform";
import { MicIcon } from "./Icons";
import type { TranslationResult, Speaker } from "@/types";
import styles from "./ConversationThread.module.css";

interface ConversationThreadProps {
  messages: TranslationResult[];
  viewer: Speaker;
  playingId: string | null;
  isRecording: boolean;
  isProcessing: boolean;
  onPlay: (id: string) => void;
}

export function ConversationThread({
  messages,
  viewer,
  playingId,
  isRecording,
  isProcessing,
  onPlay,
}: ConversationThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isRecording, isProcessing]);

  // Recording state — show waveform
  if (isRecording) {
    return <Waveform active={true} />;
  }

  // Processing state — show dots
  if (isProcessing) {
    return (
      <div className={styles.processingOverlay}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    );
  }

  // Empty state — faded mic icon
  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <MicIcon size={32} />
      </div>
    );
  }

  // Conversation
  return (
    <div className={styles.convo} ref={scrollRef}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          viewer={viewer}
          isPlaying={playingId === msg.id}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}

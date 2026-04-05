"use client";

import { MicButton } from "./MicButton";
import type { Speaker } from "@/types";
import type { SpeakerLanguage } from "@/hooks";
import styles from "./HelloPrompt.module.css";

interface HelloPromptProps {
  speaker: Speaker;
  isRecording: boolean;
  isProcessing: boolean;
  isDisabled: boolean;
  isComplete: boolean;
  detectedLanguage?: SpeakerLanguage;
  onStart: (speaker: Speaker) => void;
  onStop: (speaker: Speaker) => void;
  onRetry?: (speaker: Speaker) => void;
  flipped?: boolean;
}

export function HelloPrompt({
  speaker,
  isRecording,
  isProcessing,
  isDisabled,
  isComplete,
  detectedLanguage,
  onStart,
  onStop,
  onRetry,
  flipped = false,
}: HelloPromptProps) {
  return (
    <div
      className={styles.container}
      style={flipped ? { transform: "rotate(180deg)" } : undefined}
    >
      {isComplete && detectedLanguage ? (
        <div className={styles.detected}>
          <span className={styles.flag}>
            {detectedLanguage.detectedLanguage.flag}
          </span>
          <span className={styles.langName}>
            {detectedLanguage.languageName} detected
          </span>
          {onRetry && (
            <button
              className={styles.retryBtn}
              onClick={() => onRetry(speaker)}
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <>
          <p className={styles.prompt}>
            {isProcessing ? "Detecting language..." : "Say hello in your language"}
          </p>
          <MicButton
            speaker={speaker}
            isRecording={isRecording}
            isDisabled={isDisabled || isProcessing}
            onStart={onStart}
            onStop={onStop}
          />
        </>
      )}
    </div>
  );
}

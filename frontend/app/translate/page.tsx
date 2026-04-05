"use client";

import { useConversation } from "@/hooks";
import { MicButton, ConversationThread, ResetIcon } from "@/components";
import styles from "./page.module.css";

export default function AppPage() {
  const {
    messages,
    recordingState,
    playingId,
    error,
    startRecording,
    stopRecording,
    playMessage,
    clearConversation,
    dismissError,
  } = useConversation();

  const isRecording = recordingState.status === "recording";
  const isProcessing = recordingState.status === "processing";
  const recordingSpeaker =
    recordingState.status !== "idle" ? recordingState.speaker : null;

  return (
    <main className={styles.shell}>
      {/* Error toast */}
      {error && (
        <div className={styles.errorToast} onClick={dismissError}>
          {error}
        </div>
      )}

      {/* Top mic — flipped for person across table */}
      <MicButton
        speaker="top"
        isRecording={recordingSpeaker === "top"}
        isDisabled={recordingSpeaker === "bottom" || isProcessing}
        onStart={startRecording}
        onStop={stopRecording}
        flipped
      />

      {/* Top half — rotated conversation */}
      <div className={`${styles.half} ${styles.top}`}>
        <ConversationThread
          messages={messages}
          viewer="top"
          playingId={playingId}
          isRecording={recordingSpeaker === "top"}
          isProcessing={isProcessing}
          onPlay={playMessage}
        />
      </div>

      {/* Center divider + reset */}
      <div className={styles.centerDivider}>
        <div className={styles.dividerLine} />
        {messages.length > 0 && !isRecording && !isProcessing && (
          <button
            className={styles.resetBtn}
            onClick={clearConversation}
            aria-label="Reset conversation"
          >
            <ResetIcon size={16} />
          </button>
        )}
      </div>

      {/* Bottom half — normal orientation */}
      <div className={styles.half}>
        <ConversationThread
          messages={messages}
          viewer="bottom"
          playingId={playingId}
          isRecording={recordingSpeaker === "bottom"}
          isProcessing={isProcessing}
          onPlay={playMessage}
        />
      </div>

      {/* Bottom mic */}
      <MicButton
        speaker="bottom"
        isRecording={recordingSpeaker === "bottom"}
        isDisabled={recordingSpeaker === "top" || isProcessing}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </main>
  );
}

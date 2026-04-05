"use client";

import { useConversation } from "@/hooks";
import { MicButton, ConversationThread, ResetIcon, TextInputBar } from "@/components";
import { RegionPicker } from "@/components/RegionPicker";
import { getHearThService } from "@/lib/hearth-translation-service";
import styles from "./page.module.css";

// Swap in HearThTranslationService — everything else in the UI is unchanged.
const hearthService = getHearThService();

export default function Home() {
  const {
    messages,
    recordingState,
    playingId,
    error,
    startRecording,
    stopRecording,
    submitText,
    playMessage,
    clearConversation,
    dismissError,
  } = useConversation(hearthService);

  const isRecording = recordingState.status === "recording";
  const isProcessing = recordingState.status === "processing";
  const recordingSpeaker =
    recordingState.status !== "idle" ? recordingState.speaker : null;

  function handleClearSession() {
    clearConversation();
  }

  return (
    <main className={styles.shell}>
      {/* Error toast */}
      {error && (
        <div className={styles.errorToast} onClick={dismissError}>
          {error}
        </div>
      )}

      {/*
        Region picker for the top person (resident / flipped side).
        Sits above the top mic, rotated with it.
        Shows detected language once resident has spoken.
        Lets worker set region model before or during conversation.
      */}
      <RegionPicker onClearSession={handleClearSession} />

      {/* Top mic — flipped for person across table */}
      <MicButton
        speaker="top"
        isRecording={recordingSpeaker === "top"}
        isDisabled={recordingSpeaker === "bottom" || isProcessing}
        onStart={startRecording}
        onStop={stopRecording}
        flipped
      />

      {/* Top half — rotated conversation (resident side) */}
      <div className={`${styles.half} ${styles.top}`}>
        <ConversationThread
          messages={messages}
          viewer="top"
          playingId={playingId}
          isRecording={recordingSpeaker === "top"}
          isProcessing={isProcessing}
          onPlay={playMessage}
        />
        {/* Text input for resident — appears near their mic after rotation */}
        <TextInputBar
          speaker="top"
          onSubmit={submitText}
          isDisabled={recordingState.status !== "idle"}
        />
      </div>

      {/* Center divider + reset */}
      <div className={styles.centerDivider}>
        <div className={styles.dividerLine} />
        {messages.length > 0 && !isRecording && !isProcessing && (
          <button
            className={styles.resetBtn}
            onClick={handleClearSession}
            aria-label="Reset conversation"
          >
            <ResetIcon size={16} />
          </button>
        )}
      </div>

      {/* Bottom half — normal orientation (worker side) */}
      <div className={styles.half}>
        <ConversationThread
          messages={messages}
          viewer="bottom"
          playingId={playingId}
          isRecording={recordingSpeaker === "bottom"}
          isProcessing={isProcessing}
          onPlay={playMessage}
        />
        {/* Text input for worker — appears near their mic */}
        <TextInputBar
          speaker="bottom"
          onSubmit={submitText}
          isDisabled={recordingState.status !== "idle"}
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

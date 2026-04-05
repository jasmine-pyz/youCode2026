"use client";

import { useConversation, useInitialization } from "@/hooks";
import {
  MicButton,
  ConversationThread,
  ResetIcon,
  TextInputBar,
} from "@/components";
import { HelloPrompt } from "@/components/HelloPrompt";
import { RegionPicker } from "@/components/RegionPicker";
import { getHearThService } from "@/lib/hearth-translation-service";
import styles from "./page.module.css";

const hearthService = getHearThService();

export default function Home() {
  const {
    phase,
    topLanguage,
    bottomLanguage,
    initRecordingState,
    initError,
    startInitRecording,
    stopInitRecording,
    resetInit,
    dismissInitError,
  } = useInitialization(hearthService);

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

  function handleFullReset() {
    resetInit();
    clearConversation();
  }

  const initRecSpeaker =
    initRecordingState.status !== "idle" ? initRecordingState.speaker : null;

  // ── Initialization phase ──
  if (phase === "init") {
    return (
      <main className={styles.shell}>
        {initError && (
          <div className={styles.errorToast} onClick={dismissInitError}>
            {initError}
          </div>
        )}

        {/* Top speaker hello (flipped for person across table) */}
        <HelloPrompt
          speaker="top"
          isRecording={initRecSpeaker === "top"}
          isProcessing={
            initRecordingState.status === "processing" &&
            initRecordingState.speaker === "top"
          }
          isDisabled={initRecSpeaker !== null && initRecSpeaker !== "top"}
          isComplete={!!topLanguage}
          detectedLanguage={topLanguage ?? undefined}
          onStart={startInitRecording}
          onStop={stopInitRecording}
          onRetry={() => {
            resetInit();
          }}
          flipped
        />

        <div className={styles.centerDivider}>
          <div className={styles.dividerLine} />
        </div>

        {/* Bottom speaker hello */}
        <HelloPrompt
          speaker="bottom"
          isRecording={initRecSpeaker === "bottom"}
          isProcessing={
            initRecordingState.status === "processing" &&
            initRecordingState.speaker === "bottom"
          }
          isDisabled={initRecSpeaker !== null && initRecSpeaker !== "bottom"}
          isComplete={!!bottomLanguage}
          detectedLanguage={bottomLanguage ?? undefined}
          onStart={startInitRecording}
          onStop={stopInitRecording}
          onRetry={() => {
            resetInit();
          }}
        />
      </main>
    );
  }

  // ── Conversation phase ──
  const isRecording = recordingState.status === "recording";
  const isProcessing = recordingState.status === "processing";
  const recordingSpeaker =
    recordingState.status !== "idle" ? recordingState.speaker : null;

  return (
    <main className={styles.shell}>
      {error && (
        <div className={styles.errorToast} onClick={dismissError}>
          {error}
        </div>
      )}

      <RegionPicker onClearSession={handleFullReset} />

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
            onClick={handleFullReset}
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

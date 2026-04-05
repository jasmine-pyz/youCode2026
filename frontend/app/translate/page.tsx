"use client";

import { useState } from "react";
import { useConversation } from "@/hooks";
import { MicButton, ConversationThread, SupportPanel } from "@/components";
import styles from "./page.module.css";

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<"talk" | "support">("talk");

  const {
    messages,
    recordingState,
    playingId,
    error,
    startRecording,
    stopRecording,
    playMessage,
    sendMessage,
    dismissError,
  } = useConversation();

  const isRecording = recordingState.status === "recording";
  const isProcessing = recordingState.status === "processing";
  const recordingSpeaker =
    recordingState.status !== "idle" ? recordingState.speaker : null;

  function handlePromptSelect(text: string) {
    sendMessage(text, "bottom", true);
    setActiveTab("talk");
  }

  return (
    <main className={styles.shell}>
      {/* Error toast */}
      {error && (
        <div className={styles.errorToast} onClick={dismissError}>
          {error}
        </div>
      )}

      {/* Persistent tab bar — top right */}
      <div className={styles.persistentTab}>
        <div className={styles.tabBar}>
          <div className={`${styles.slider} ${activeTab === "support" ? styles.sliderRight : ""}`} />
          <button
            className={`${styles.tab} ${activeTab === "talk" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("talk")}
          >
            Talk
          </button>
          <button
            className={`${styles.tab} ${activeTab === "support" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("support")}
          >
            Support
          </button>
        </div>
      </div>

      {activeTab === "talk" ? (
        <>
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

          {/* Center divider */}
          <div className={styles.centerDivider}>
            <div className={styles.dividerLine} />
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
        </>
      ) : (
        <SupportPanel onSelect={handlePromptSelect} />
      )}
    </main>
  );
}

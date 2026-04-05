"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type {
  TranslationResult,
  RecordingState,
  Speaker,
  TranslationService,
  DetectedLanguage,
} from "@/types";
import { getTranslationService, makeDetectedLanguage } from "@/lib/translation-service";

// ─── useConversation ───
// Manages the full conversation state: messages, recording, translation, playback.

interface UseConversationReturn {
  messages: TranslationResult[];
  recordingState: RecordingState;
  playingId: string | null;
  error: string | null;
  startRecording: (speaker: Speaker) => Promise<void>;
  stopRecording: (speaker: Speaker) => Promise<void>;
  sendMessage: (text: string, speaker: Speaker, autoPlay?: boolean) => Promise<void>;
  submitText: (text: string, speaker: Speaker) => Promise<void>;
  playMessage: (messageId: string) => Promise<void>;
  clearConversation: () => void;
  dismissError: () => void;
}

export function useConversation(
  service?: TranslationService
): UseConversationReturn {
  const [messages, setMessages] = useState<TranslationResult[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    status: "idle",
  });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordingHandleRef = useRef<any>(null);
  const svc = service || getTranslationService();

  // Keep a ref in sync with recordingState so callbacks always see
  // the latest value without needing it in their dependency arrays.
  const recordingStateRef = useRef(recordingState);
  recordingStateRef.current = recordingState;

  const startRecording = useCallback(
    async (speaker: Speaker) => {
      if (recordingStateRef.current.status !== "idle") return;

      try {
        setError(null);
        setRecordingState({ status: "recording", speaker });
        const handle = await svc.startRecording();
        recordingHandleRef.current = handle;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to start recording";
        setError(message);
        setRecordingState({ status: "idle" });
      }
    },
    [svc]
  );

  const stopRecording = useCallback(
    async (speaker: Speaker) => {
      const currentState = recordingStateRef.current;
      if (
        currentState.status !== "recording" ||
        currentState.speaker !== speaker
      ) {
        return;
      }

      const handle = recordingHandleRef.current;
      if (!handle) return;
      recordingHandleRef.current = null;

      try {
        setRecordingState({ status: "processing", speaker });

        // 1. Stop recording → get transcript + detected language
        const recordingResult = await svc.stopRecording(handle);

        if (!recordingResult.transcript.trim()) {
          setRecordingState({ status: "idle" });
          return;
        }

        // 2. Translate the transcript
        const translateResult = await svc.translate({
          text: recordingResult.transcript,
          sourceLanguage: recordingResult.detectedLanguage.code,
        });

        // 3. Build the message
        const message: TranslationResult = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speaker,
          detectedLanguage: recordingResult.detectedLanguage,
          targetLanguage: translateResult.targetLanguage,
          originalText: recordingResult.transcript,
          translatedText: translateResult.translatedText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
        setRecordingState({ status: "idle" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Translation failed";
        setError(message);
        setRecordingState({ status: "idle" });
      }
    },
    [svc]
  );

  const submitText = useCallback(
    async (text: string, speaker: Speaker) => {
      if (!text.trim() || recordingStateRef.current.status !== "idle") return;

      setError(null);
      setRecordingState({ status: "processing", speaker });

      try {
        // top = resident side → pass non-"en" so service routes to _residentTranslate
        // bottom = worker side → pass "en" so service routes to _workerTranslate
        const sourceLanguage = speaker === "bottom" ? "en" : "und"; // "und" = undetermined

        const translateResult = await svc.translate({ text, sourceLanguage });

        const detectedLang: DetectedLanguage =
          translateResult.detectedSourceLanguage ?? {
            code: speaker === "bottom" ? "en" : "und",
            flag: speaker === "bottom" ? "🇬🇧" : "🌐",
            confidence: 1,
          };

        const message: TranslationResult = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speaker,
          detectedLanguage: detectedLang,
          targetLanguage: translateResult.targetLanguage,
          originalText: text,
          translatedText: translateResult.translatedText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, message]);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Translation failed";
        setError(message);
      } finally {
        setRecordingState({ status: "idle" });
      }
    },
    [svc]
  );

  const playMessage = useCallback(
    async (messageId: string) => {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg || playingId) return;

      try {
        setPlayingId(messageId);
        await svc.speak(msg.translatedText, msg.targetLanguage.code);
      } catch (err) {
        console.warn("TTS playback failed:", err);
      } finally {
        setPlayingId(null);
      }
    },
    [messages, playingId, svc]
  );

  const sendMessage = useCallback(
    async (text: string, speaker: Speaker, autoPlay = false) => {
      if (recordingStateRef.current.status !== "idle") return;
      setRecordingState({ status: "processing", speaker });
      try {
        const translateResult = await svc.translate({ text, sourceLanguage: "en" });
        const message: TranslationResult = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speaker,
          detectedLanguage: makeDetectedLanguage("en"),
          targetLanguage: translateResult.targetLanguage,
          originalText: text,
          translatedText: translateResult.translatedText,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, message]);
        setRecordingState({ status: "idle" });
        if (autoPlay) {
          try {
            setPlayingId(message.id);
            await svc.speak(message.translatedText, message.targetLanguage.code);
          } catch { } finally {
            setPlayingId(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        setRecordingState({ status: "idle" });
      }
    },
    [svc]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
    setRecordingState({ status: "idle" });
    setPlayingId(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return {
    messages,
    recordingState,
    playingId,
    error,
    startRecording,
    stopRecording,
    sendMessage,
    submitText,
    playMessage,
    clearConversation,
    dismissError,
  };
}

// ─── useWaveform ───
// Generates animated waveform bar heights for the recording visualization.

export function useWaveform(active: boolean, barCount: number = 12) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(4));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(() => {
        setBars(
          Array(barCount)
            .fill(0)
            .map(() => Math.random() * 24 + 5)
        );
      }, 90);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setBars(Array(barCount).fill(4));
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, barCount]);

  return bars;
}

// ─── usePWA ───
// Tracks PWA install state and provides install prompt.

interface PWAState {
  isOnline: boolean;
  canInstall: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
}

export function usePWA(): PWAState {
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const deferredPromptRef = useRef<any>(null);

  useEffect(() => {
    // Online/offline tracking
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Standalone detection
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
    );

    // Install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPromptRef.current) return;
    deferredPromptRef.current.prompt();
    const result = await deferredPromptRef.current.userChoice;
    if (result.outcome === "accepted") {
      setCanInstall(false);
    }
    deferredPromptRef.current = null;
  }, []);

  return { isOnline, canInstall, isStandalone, promptInstall };
}

"use client";

import { SpeakerIcon, PlayingIcon, MicIcon } from "./Icons";
import { Waveform } from "./Waveform";
import type { TranslationResult, Speaker } from "@/types";
import styles from "./ConversationThread.module.css";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",   es: "Español",    ar: "العربية",    uk: "Українська",
  fr: "Français",  zh: "普通话",      yue: "廣東話",    pa: "ਪੰਜਾਬੀ",
  fa: "فارسی",     vi: "Tiếng Việt", am: "አማርኛ",      tl: "Filipino",
  de: "Deutsch",   pt: "Português",  ru: "Русский",    ja: "日本語",
  ko: "한국어",     hi: "हिन्दी",      sw: "Kiswahili",  so: "Soomaali",
  ti: "ትግርኛ",
};

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code.split("-")[0].toLowerCase()] ?? code.toUpperCase();
}

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
  if (isRecording) return <Waveform active={true} />;

  if (isProcessing) {
    return (
      <div className={styles.processingOverlay}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    );
  }

  const latest = messages[messages.length - 1] ?? null;

  if (!latest) {
    return (
      <div className={styles.empty}>
        <MicIcon size={32} />
      </div>
    );
  }

  const isMyMessage = latest.speaker === viewer;
  const text = isMyMessage ? latest.originalText : latest.translatedText;
  const lang = isMyMessage ? latest.detectedLanguage : latest.targetLanguage;
  const isPlaying = playingId === latest.id;

  return (
    <div className={styles.view}>
      <div className={styles.langBadge}>
        {lang.flag} {getLanguageName(lang.code)}
      </div>
      <p className={styles.text}>{text}</p>
      <button
        className={`${styles.playBtn} ${isPlaying ? styles.playing : ""}`}
        onClick={() => onPlay(latest.id)}
        aria-label="Play aloud"
      >
        {isPlaying ? <PlayingIcon size={22} /> : <SpeakerIcon size={22} />}
      </button>
    </div>
  );
}

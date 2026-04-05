/**
 * HearThTranslationService
 *
 * Implements TranslationService using:
 * - Web Speech API for STT (same as the existing service)
 * - Tiny Aya (via FastAPI backend) for translation
 * - Web SpeechSynthesis for TTS (Phase 0 — swap for better TTS in Phase 1)
 *
 * Drop-in replacement for WebSpeechTranslationService.
 * Nothing in the hook or UI components changes.
 *
 * Session logic:
 * - First non-English speaker → their language is stored as residentLanguage
 * - Worker (English speaker) → translates INTO residentLanguage
 * - Resident → always translates INTO English
 * - Region model (earth/fire/water/global) can be set at any time
 *   to improve translation quality without changing the language direction
 */

import type {
  TranslationService,
  RecordingHandle,
  RecordingResult,
  TranslateParams,
  TranslateResult,
  DetectedLanguage,
} from "@/types";
import { makeDetectedLanguage, getFlag } from "./translation-service";

// ─── Region → model key ───

export type RegionKey = "global" | "earth" | "fire" | "water";

export const REGION_LABELS: Record<RegionKey, string> = {
  global: "Auto",
  earth: "Earth",
  fire: "Fire",
  water: "Water",
};

export const REGION_DESCRIPTIONS: Record<RegionKey, string> = {
  global: "All 70 languages",
  earth: "Africa + West Asia",
  fire: "South Asia",
  water: "Asia-Pacific",
};

// ─── Session state (module-level singleton) ───
// Kept outside the class so it survives service re-instantiation.

let _residentLanguage: DetectedLanguage | null = null;
let _residentLanguageName: string | null = null; // full name e.g. "French"
let _regionKey: RegionKey = "global";

export function getResidentLanguage(): DetectedLanguage | null {
  return _residentLanguage;
}

export function setRegionKey(key: RegionKey): void {
  _regionKey = key;
}

export function getRegionKey(): RegionKey {
  return _regionKey;
}

export function clearSession(): void {
  _residentLanguage = null;
  _residentLanguageName = null;
}

export function setResidentLanguageManual(name: string, code: string, flag: string): void {
  _residentLanguage = {
    code,
    flag,
    confidence: 1,
  };
  _residentLanguageName = name;
}

// ─── Recording infrastructure (shared with existing service) ───

interface ActiveRecording {
  recognition: any;
  transcript: string;
  detectedLang: string;
  mediaRecorder?: MediaRecorder;
  audioChunks: Blob[];
}

let activeRecording: ActiveRecording | null = null;
let recordingCounter = 0;

// ─── localStorage helpers (safe for SSR) ───

function storedToken(): string {
  try {
    return localStorage.getItem("hearth_hf_token") || "";
  } catch {
    return "";
  }
}

function storedServer(): string {
  try {
    return localStorage.getItem("hearth_server") || "http://localhost:8000";
  } catch {
    return "http://localhost:8000";
  }
}

// ─── HearThTranslationService ───

export class HearThTranslationService implements TranslationService {
  constructor() {}

  /** Resolves the backend base URL at call-time from localStorage */
  private get base(): string {
    return storedServer();
  }

  // ── STT: identical to WebSpeechTranslationService ──

  async startRecording(): Promise<RecordingHandle> {
    if (activeRecording) throw new Error("Already recording");

    const id = `rec-${++recordingCounter}`;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error(
        "SpeechRecognition not supported. Use Chrome, Edge, or Safari."
      );
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;

    let mediaRecorder: MediaRecorder | undefined;
    const audioChunks: Blob[] = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.start();
    } catch {
      console.warn("Raw audio capture unavailable");
    }

    return new Promise<RecordingHandle>((resolve) => {
      activeRecording = {
        recognition,
        transcript: "",
        detectedLang: "en",
        mediaRecorder,
        audioChunks,
      };

      recognition.onresult = (event: any) => {
        let full = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) full += event.results[i][0].transcript;
        }
        activeRecording!.transcript = full;
        const latest = event.results[event.results.length - 1];
        if (latest[0].lang) activeRecording!.detectedLang = latest[0].lang;
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "aborted") {
          console.error("Speech recognition error:", event.error);
          activeRecording = null;
        }
      };

      recognition.start();
      resolve({ id });
    });
  }

  async stopRecording(_handle: RecordingHandle): Promise<RecordingResult> {
    if (!activeRecording) throw new Error("No active recording");

    const rec = activeRecording;
    rec.recognition.stop();

    if (rec.mediaRecorder && rec.mediaRecorder.state !== "inactive") {
      rec.mediaRecorder.stop();
      rec.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }

    await new Promise((r) => setTimeout(r, 300));

    const audioBlob =
      rec.audioChunks.length > 0
        ? new Blob(rec.audioChunks, { type: "audio/webm" })
        : undefined;

    const result: RecordingResult = {
      transcript: rec.transcript,
      detectedLanguage: makeDetectedLanguage(rec.detectedLang),
      audioBlob,
    };

    activeRecording = null;
    return result;
  }

  // ── Translation: Tiny Aya via FastAPI backend ──

  async translate(params: TranslateParams): Promise<TranslateResult> {
    // "en" = worker speaking English → translate into resident's language
    // anything else (including "auto") = resident → detect + translate to English

    const isWorker = params.sourceLanguage === "en";

    if (isWorker) {
      // Worker speaking English → translate into resident's detected language
      return this._workerTranslate(params.text);
    } else {
      // Resident speaking → detect language (already done by STT) + translate to English
      return this._residentTranslate(params.text, params.sourceLanguage);
    }
  }

  private async _residentTranslate(
    text: string,
    sttDetectedCode: string
  ): Promise<TranslateResult> {
    const res = await fetch(`${this.base}/detect-and-translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HF-Token": storedToken(),
      },
      body: JSON.stringify({ text, model_key: _regionKey }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const detail = err.detail;
      const message =
        typeof detail === "object" && detail?.message
          ? detail.message
          : detail || "Translation failed";
      throw new Error(message);
    }

    const data = await res.json();

    _residentLanguageName = data.detected_language || null;
    const detectedCode = data.detected_language_code || sttDetectedCode;

    _residentLanguage = {
      code: detectedCode,
      flag: getFlag(detectedCode),
      confidence: 0.9,
    };

    return {
      translatedText: data.translation, 
      targetLanguage: makeDetectedLanguage("en"),
      detectedSourceLanguage: _residentLanguage ?? undefined,
    };
  }

  private async _workerTranslate(text: string): Promise<TranslateResult> {
    if (!_residentLanguage || !_residentLanguageName) {
      // Resident hasn't spoken yet — show a helpful error instead of silent passthrough
      throw new Error(
        "Please have the resident speak or type first so their language can be detected."
      );
    }

    const res = await fetch(`${this.base}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HF-Token": storedToken(),
      },
      body: JSON.stringify({
        text,
        model_key: _regionKey,
        target_lang: _residentLanguageName,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      const detail = err.detail;
      const message =
        typeof detail === "object" && detail?.message
          ? detail.message
          : detail || "Translation failed";
      throw new Error(message);
    }

    const data = await res.json();

    return {
      translatedText: data.translation,
      targetLanguage: _residentLanguage,
    };
  }

  // ── TTS: browser SpeechSynthesis (Phase 0) ──

  async speak(text: string, languageCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("SpeechSynthesis not supported"));
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      utterance.rate = 0.9;

      const voices = speechSynthesis.getVoices();
      const match = voices.find((v) =>
        v.lang.toLowerCase().startsWith(languageCode.toLowerCase())
      );
      if (match) utterance.voice = match;

      utterance.onend = () => resolve("");
      utterance.onerror = (e) => reject(new Error(`TTS error: ${e.error}`));

      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  }
}

// ─── Singleton ───

let _instance: HearThTranslationService | null = null;

export function getHearThService(): HearThTranslationService {
  if (!_instance) {
    _instance = new HearThTranslationService();
  }
  return _instance;
}

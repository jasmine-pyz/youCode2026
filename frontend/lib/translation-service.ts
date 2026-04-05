/**
 * Translation Service — Web Speech API Implementation
 *
 * This is a browser-native implementation using:
 * - SpeechRecognition API for speech-to-text + language detection
 * - SpeechSynthesis API for text-to-speech playback
 * - A pluggable translate() method for your backend
 *
 * To connect your own backend:
 * 1. Replace the translate() method with your API call
 * 2. Optionally replace startRecording/stopRecording with a
 *    custom STT service (e.g. Whisper, Deepgram, etc.)
 * 3. Optionally replace speak() with a custom TTS service
 *
 * For on-device LLM translation:
 * - You can run a local translation server and point translate() at it
 * - Or use WebLLM / Transformers.js for fully in-browser translation
 */

import type {
  TranslationService,
  RecordingHandle,
  RecordingResult,
  TranslateParams,
  TranslateResult,
  DetectedLanguage,
} from "@/types";

// ─── Language flag mapping ───

const LANGUAGE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  ar: "🇸🇦",
  uk: "🇺🇦",
  fr: "🇫🇷",
  zh: "🇨🇳",
  "zh-CN": "🇨🇳",
  "zh-TW": "🇹🇼",
  yue: "🇭🇰", // Cantonese
  pa: "🇮🇳", // Punjabi
  fa: "🇮🇷", // Farsi / Persian
  vi: "🇻🇳", // Vietnamese
  am: "🇪🇹",
  tl: "🇵🇭",
  de: "🇩🇪",
  pt: "🇧🇷",
  ru: "🇷🇺",
  ja: "🇯🇵",
  ko: "🇰🇷",
  hi: "🇮🇳",
  sw: "🇰🇪",
  so: "🇸🇴",
  ti: "🇪🇷",
};

function getFlag(langCode: string): string {
  const base = langCode.split("-")[0].toLowerCase();
  return LANGUAGE_FLAGS[langCode] || LANGUAGE_FLAGS[base] || "🌐";
}

function makeDetectedLanguage(
  code: string,
  confidence: number = 0.9
): DetectedLanguage {
  return {
    code: code.split("-")[0].toLowerCase(),
    flag: getFlag(code),
    confidence,
  };
}

// ─── Web Speech API implementation ───

type SpeechRecognitionType = typeof window extends {
  SpeechRecognition: infer T;
}
  ? T
  : any;

interface ActiveRecording {
  recognition: any;
  resolve: (result: RecordingResult) => void;
  reject: (error: Error) => void;
  transcript: string;
  detectedLang: string;
  mediaRecorder?: MediaRecorder;
  audioChunks: Blob[];
}

let activeRecording: ActiveRecording | null = null;
let recordingCounter = 0;

export class WebSpeechTranslationService implements TranslationService {
  private defaultTargetLang: string;

  /**
   * @param defaultTargetLang - fallback target language if auto-detection
   *   doesn't determine a good target. Default "en".
   */
  constructor(defaultTargetLang: string = "en") {
    this.defaultTargetLang = defaultTargetLang;
  }

  async startRecording(): Promise<RecordingHandle> {
    if (activeRecording) {
      throw new Error("Already recording");
    }

    const id = `rec-${++recordingCounter}`;

    // Get SpeechRecognition constructor (browser-prefixed)
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      throw new Error(
        "SpeechRecognition API not supported in this browser. " +
          "Try Chrome, Edge, or Safari."
      );
    }

    const recognition = new SpeechRecognition();

    // Enable continuous recognition so the session stays alive until
    // the user releases the mic button (allows multiple recordings).
    recognition.continuous = true;
    recognition.interimResults = false;

    // Auto language detection: don't set recognition.lang
    // This tells the browser to try detecting the language.
    // NOTE: Browser support for auto-detection varies.
    // For more reliable detection, use a backend service.
    recognition.lang = ""; // uncomment if your browser supports it

    // Start audio capture for potential raw audio storage
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
      // Microphone access denied or unavailable — continue without raw audio
      console.warn("Could not access microphone for raw audio capture");
    }

    return new Promise<RecordingHandle>((resolveStart) => {
      const recordingPromise = new Promise<RecordingResult>(
        (resolve, reject) => {
          activeRecording = {
            recognition,
            resolve,
            reject,
            transcript: "",
            detectedLang: "en",
            mediaRecorder,
            audioChunks,
          };

          recognition.onresult = (event: any) => {
            // Accumulate all final transcripts (continuous mode may
            // fire onresult multiple times).
            let fullTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                fullTranscript += event.results[i][0].transcript;
              }
            }
            activeRecording!.transcript = fullTranscript;
            // Try to get detected language from the latest result
            // NOTE: Not all browsers expose this
            const latest = event.results[event.results.length - 1];
            if (latest[0].lang) {
              activeRecording!.detectedLang = latest[0].lang;
            }
          };

          recognition.onerror = (event: any) => {
            if (event.error !== "aborted") {
              reject(new Error(`Speech recognition error: ${event.error}`));
              activeRecording = null;
            }
          };

          recognition.onend = () => {
            // Recognition ended (either naturally or via stop())
            // Resolution happens in stopRecording()
          };

          recognition.start();
          resolveStart({ id });
        }
      );

      // Store the promise so stopRecording can await it
      (activeRecording as any)._promise = recordingPromise;
    });
  }

  async stopRecording(handle: RecordingHandle): Promise<RecordingResult> {
    if (!activeRecording) {
      throw new Error("No active recording to stop");
    }

    const rec = activeRecording;

    // Stop the speech recognition
    rec.recognition.stop();

    // Stop the media recorder
    if (rec.mediaRecorder && rec.mediaRecorder.state !== "inactive") {
      rec.mediaRecorder.stop();
      // Stop all tracks on the stream
      rec.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }

    // Wait a tick for final results to come in
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

  /**
   * TRANSLATE — This is where you plug in your backend.
   *
   * Current implementation: placeholder that returns the original text.
   * Replace with your actual translation API call.
   *
   * Example with a REST API:
   * ```
   * const response = await fetch('/api/translate', {
   *   method: 'POST',
   *   body: JSON.stringify({
   *     text: params.text,
   *     source: params.sourceLanguage,
   *     target: params.targetLanguage,
   *   }),
   * });
   * const data = await response.json();
   * return {
   *   translatedText: data.translatedText,
   *   targetLanguage: makeDetectedLanguage(data.targetLanguage),
   * };
   * ```
   *
   * Example with on-device LLM:
   * ```
   * const result = await localLLM.generate(
   *   `Translate from ${params.sourceLanguage} to ${target}: ${params.text}`
   * );
   * ```
   */
  async translate(params: TranslateParams): Promise<TranslateResult> {
    const target = params.targetLanguage || this.defaultTargetLang;

    // ──────────────────────────────────────────────
    // 🔌 REPLACE THIS with your actual translation backend
    // ──────────────────────────────────────────────

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: params.text,
        sourceLanguage: params.sourceLanguage,
        targetLanguage: target,
      }),
    });

    if (!response.ok) {
      // Fallback: return original text if backend is unavailable
      console.warn("Translation API unavailable, returning original text");
      return {
        translatedText: `[${target}] ${params.text}`,
        targetLanguage: makeDetectedLanguage(target),
      };
    }

    const data = await response.json();
    return {
      translatedText: data.translatedText,
      targetLanguage: makeDetectedLanguage(data.targetLanguage || target),
    };

    // ──────────────────────────────────────────────
  }

  /**
   * TEXT-TO-SPEECH — Uses browser SpeechSynthesis API.
   * Replace with your own TTS service for better quality.
   */
  async speak(text: string, languageCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("SpeechSynthesis not supported"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Try to find a voice matching the language
      const voices = speechSynthesis.getVoices();
      const match = voices.find((v) =>
        v.lang.toLowerCase().startsWith(languageCode.toLowerCase())
      );
      if (match) utterance.voice = match;

      utterance.onend = () => resolve("");
      utterance.onerror = (e) => reject(new Error(`TTS error: ${e.error}`));

      speechSynthesis.cancel(); // cancel any ongoing speech
      speechSynthesis.speak(utterance);
    });
  }
}

// ─── Export singleton ───

let serviceInstance: WebSpeechTranslationService | null = null;

export function getTranslationService(): TranslationService {
  if (!serviceInstance) {
    serviceInstance = new WebSpeechTranslationService("en");
  }
  return serviceInstance;
}

export { makeDetectedLanguage, getFlag };

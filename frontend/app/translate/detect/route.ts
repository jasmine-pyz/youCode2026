/**
 * POST /api/translate/detect
 *
 * Proxies to FastAPI /detect-and-translate
 * Resident speaks any language → detect it + translate to English
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.HEARTH_BACKEND_URL || "http://localhost:8000";
const HF_TOKEN = process.env.HF_TOKEN || "";

// Language name → ISO 639-1 code (best-effort mapping for common shelter languages)
const LANG_NAME_TO_CODE: Record<string, string> = {
  english: "en",
  arabic: "ar",
  amharic: "am",
  somali: "so",
  tigrinya: "ti",
  farsi: "fa",
  persian: "fa",
  hindi: "hi",
  punjabi: "pa",
  urdu: "ur",
  bengali: "bn",
  tamil: "ta",
  gujarati: "gu",
  swahili: "sw",
  french: "fr",
  spanish: "es",
  vietnamese: "vi",
  tagalog: "tl",
  korean: "ko",
  burmese: "my",
  khmer: "km",
  thai: "th",
  chinese: "zh",
  german: "de",
  russian: "ru",
};

function langNameToCode(name: string): string {
  const lower = name.toLowerCase().trim();
  return LANG_NAME_TO_CODE[lower] || lower.slice(0, 2).toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, model_key } = body;

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/detect-and-translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HF-Token": HF_TOKEN,
      },
      body: JSON.stringify({ text, model_key: model_key || "global" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();

    // data.detected_language is a human-readable name from Tiny Aya
    // e.g. "Amharic", "Arabic", "Unknown"
    const detectedName: string = data.detected_language || "Unknown";
    const detectedCode = langNameToCode(detectedName);

    return NextResponse.json({
      translation: data.translation,
      detected_language: detectedName,
      detected_language_code: detectedCode,
      model_used: data.model_used,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

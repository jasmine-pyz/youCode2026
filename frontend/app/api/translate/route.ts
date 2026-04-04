import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/translate
 *
 * This is the API route your frontend calls to translate text.
 * Replace the implementation below with your actual translation backend.
 *
 * Request body:
 * {
 *   text: string;
 *   sourceLanguage: string;   // ISO 639-1 code, e.g. "es"
 *   targetLanguage: string;   // ISO 639-1 code, e.g. "en"
 * }
 *
 * Response:
 * {
 *   translatedText: string;
 *   targetLanguage: string;
 * }
 *
 * ─── INTEGRATION OPTIONS ───
 *
 * 1. On-device LLM (e.g. llama.cpp server running locally):
 *    const response = await fetch('http://localhost:8080/v1/chat/completions', {
 *      method: 'POST',
 *      body: JSON.stringify({
 *        messages: [{
 *          role: 'user',
 *          content: `Translate from ${source} to ${target}: ${text}`
 *        }],
 *      }),
 *    });
 *
 * 2. Cloud API (e.g. Google Translate, DeepL):
 *    const response = await fetch('https://translation.googleapis.com/...', { ... });
 *
 * 3. Self-hosted model (e.g. NLLB, MarianMT via HuggingFace):
 *    const response = await fetch('https://your-server.com/translate', { ... });
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceLanguage, targetLanguage } = body;

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text, sourceLanguage, targetLanguage" },
        { status: 400 }
      );
    }

    // ──────────────────────────────────────────────
    // 🔌 REPLACE THIS BLOCK with your translation backend
    // ──────────────────────────────────────────────

    // Placeholder: echo back with a marker
    // In production, call your LLM / translation API here
    const translatedText = `[${targetLanguage}] ${text}`;

    // ──────────────────────────────────────────────

    return NextResponse.json({
      translatedText,
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 }
    );
  }
}

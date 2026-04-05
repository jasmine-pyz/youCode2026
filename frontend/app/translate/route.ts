/**
 * POST /api/translate
 *
 * Proxies to FastAPI /translate
 * Worker speaks English → translates into resident's detected language
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.HEARTH_BACKEND_URL || "http://localhost:8000";
const HF_TOKEN = process.env.HF_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, model_key, target_lang } = body;

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HF-Token": HF_TOKEN,
      },
      body: JSON.stringify({ text, model_key: model_key || "global", target_lang }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();

    // Normalise response shape for the frontend service
    return NextResponse.json({
      translation: data.translation,
      model_used: data.model_used,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ detail: message }, { status: 500 });
  }
}

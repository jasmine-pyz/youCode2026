import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

// Proxy POST /api/translate/detect → FastAPI /detect-and-translate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND}/detect-and-translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-HF-Token": request.headers.get("X-HF-Token") ?? "",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 503 });
  }
}

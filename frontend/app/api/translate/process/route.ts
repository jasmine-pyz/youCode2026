import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

// Proxy POST /api/translate/process → FastAPI /process
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const res = await fetch(`${BACKEND}/process`, {
      method: "POST",
      headers: {
        "X-HF-Token": request.headers.get("X-HF-Token") ?? "",
      },
      body: form,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 503 });
  }
}

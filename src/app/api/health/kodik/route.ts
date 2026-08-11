import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = process.env.KODIK_API_TOKEN ?? "";
  if (!token) {
    return NextResponse.json({ tokenPresent: false, tokenValid: false, statusCode: 401, message: "Token missing" }, { status: 401 });
  }
  try {
    const testUrl = `https://kodik-api.com/search?token=${encodeURIComponent(token)}&title=test&limit=1`;
    const res = await fetch(testUrl);
    const data = await res.json();
    const valid = !!(data && Array.isArray(data.results));
    return NextResponse.json({ tokenPresent: true, tokenValid: valid, statusCode: res.status, message: valid ? "OK" : "Invalid" }, { status: valid ? 200 : 403 });
  } catch (e) {
    console.error("[HealthCheck] Kodik test request failed:", e);
    return NextResponse.json({ tokenPresent: true, tokenValid: false, statusCode: 500, message: "Network error" }, { status: 500 });
  }
}

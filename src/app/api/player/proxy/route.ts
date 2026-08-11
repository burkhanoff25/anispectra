import { NextResponse } from "next/server";
import { normalizePlayerLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    const fullUrl = normalizePlayerLink(targetUrl);

    // Xavfsiz redirect: Iframe ichida yuklanishi uchun kerakli sarlavhalar
    const headers = new Headers();
    // Iframe'dan Kodik ga o'tish uchun ruxsatlar
    headers.set("Access-Control-Allow-Origin", "*");
    
    return NextResponse.redirect(fullUrl, {
      status: 302,
      headers
    });
  } catch (error) {
    console.error(`[API_ERROR] operation=playerProxy status=500 url=/api/player/proxy message=${error instanceof Error ? error.message : "Unknown error"}`);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

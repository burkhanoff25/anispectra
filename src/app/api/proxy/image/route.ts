import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    const hostname = targetUrl.hostname.toLowerCase();

    // Allow MangaDex and common image CDN domains
    const isAllowedDomain =
      hostname.endsWith("mangadex.org") ||
      hostname.endsWith("mangadex.network") ||
      hostname.endsWith("anilibria.top") ||
      hostname.endsWith("shikimori.one") ||
      hostname.endsWith("shikimori.me");

    if (!isAllowedDomain) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    const imageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: "https://mangadex.org/",
      },
      next: { revalidate: 86400 },
    });

    if (!imageRes.ok) {
      return new NextResponse(`Failed to fetch image from source: ${imageRes.status}`, {
        status: imageRes.status,
      });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return new NextResponse("Internal Server Error while proxying image", { status: 500 });
  }
}

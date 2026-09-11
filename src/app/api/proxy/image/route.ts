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

    // Disallow private/local IPs to prevent SSRF
    const isPrivate =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("172.16.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal");

    if (isPrivate || (!targetUrl.protocol.startsWith("http:") && !targetUrl.protocol.startsWith("https:"))) {
      return new NextResponse("Forbidden domain", { status: 403 });
    }

    let referer = `https://${hostname}/`;
    if (hostname.endsWith("myanimelist.net")) {
      referer = "https://myanimelist.net/";
    } else if (hostname.endsWith("anilibria.top")) {
      referer = "https://anilibria.top/";
    } else if (hostname.includes("shikimori")) {
      referer = "https://shikimori.one/";
    } else if (hostname.endsWith("yani.tv")) {
      referer = "https://yani.tv/";
    } else if (hostname.endsWith("anihub.top") || hostname.endsWith("anihub.uz")) {
      referer = "https://anihub.top/";
    } else if (hostname.endsWith("mangadex.org") || hostname.endsWith("mangadex.network")) {
      referer = "https://mangadex.org/";
    }

    const imageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: referer,
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

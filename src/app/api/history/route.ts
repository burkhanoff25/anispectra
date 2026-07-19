import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { HistoryService } from "@/server/history/HistoryService";
import { UserService } from "@/lib/api/user.service";

// Basic in-memory rate limiter
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 2000;

export async function POST(req: NextRequest) {
  try {
    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const lastRequestTime = rateLimitMap.get(ip) || 0;
    if (now - lastRequestTime < RATE_LIMIT_WINDOW_MS) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    rateLimitMap.set(ip, now);
    if (rateLimitMap.size > 10000) rateLimitMap.clear();

    const session = await getServerSession(authOptions);
    const cookieStore = cookies();
    const cookieStr = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const aniProfile = await UserService.getProfile(cookieStr).catch(() => null);
    
    const body = await req.json();
    const { type, ...data } = body;
    
    const userId = session?.user?.id;
    const aniLibertyId = aniProfile?.id ? String(aniProfile.id) : undefined;

    if (!userId && !aniLibertyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (type === "anime") {
      await HistoryService.upsertAnimeHistory({
        userId,
        aniLibertyId,
        titleId: data.titleId,
        episode: data.episode,
        season: data.season || 1,
        progressSeconds: data.progressSeconds,
      });
      return NextResponse.json({ success: true });
    }

    if (type === "manga") {
      await HistoryService.upsertMangaHistory({
        userId,
        aniLibertyId,
        mangaId: data.mangaId,
        chapter: data.chapter,
        page: data.page,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: unknown) {
    console.error("[History API Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

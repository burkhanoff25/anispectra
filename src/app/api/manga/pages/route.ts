import { NextResponse } from "next/server";
import { MangaService } from "@/lib/api/manga.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json({ error: "Missing chapterId" }, { status: 400 });
  }

  const pages = await MangaService.getChapterPages(chapterId);
  return NextResponse.json({ pages });
}

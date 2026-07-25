import { NextResponse } from "next/server";
import { getYoutubeShorts } from "@/lib/youtube";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const shorts = await getYoutubeShorts();
    return NextResponse.json(shorts);
  } catch (error) {
    console.error("Failed to fetch YouTube Shorts in route:", error);
    return NextResponse.json({ error: "Failed to fetch Shorts" }, { status: 500 });
  }
}

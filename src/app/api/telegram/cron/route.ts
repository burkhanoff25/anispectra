import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { bot } from "@/server/bot/bot";
import { AnimeService } from "@/lib/api/anime.service";

export const dynamic = "force-dynamic";

// This is a simple cron endpoint to check for new episodes.
// You should protect this with an authorization header in production
// (e.g., checking process.env.CRON_SECRET).
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch the latest episodes from AnimeService (since mostly anime gets updated daily)
    // For Dorama/Manga, similar logic would apply, but let's implement Anime first.
    const latestAnime = await AnimeService.getLatestReleases(20);
    
    let notifiedCount = 0;

    for (const anime of latestAnime) {
      if (!anime.alias || !anime.episodes || anime.episodes.length === 0) continue;
      
      const lastAvailableEpisode = Math.max(...anime.episodes.map(e => e.ordinal));

      // Find users subscribed to this anime
      const subs = await prisma.telegramSubscription.findMany({
        where: {
          type: "anime",
          releaseId: anime.alias,
          lastEpisode: {
            lt: lastAvailableEpisode // only notify if they haven't been notified for this episode
          }
        }
      });

      for (const sub of subs) {
        try {
          // Send telegram message
          await bot.api.sendMessage(
            Number(sub.telegramUserId),
            `🎉 Вышла новая серия!\n\n*${anime.name?.main || anime.name?.english}*\nДоступна серия: ${lastAvailableEpisode}\n\n[Смотреть онлайн](https://anispectra.uz/anime/${anime.alias})`,
            { parse_mode: "Markdown" }
          );
          
          // Update the last notified episode
          await prisma.telegramSubscription.update({
            where: { id: sub.id },
            data: { lastEpisode: lastAvailableEpisode }
          });
          
          notifiedCount++;
        } catch (err) {
          console.error(`Failed to notify user ${sub.telegramUserId} about ${anime.alias}`, err);
        }
      }
    }

    return NextResponse.json({ success: true, notifiedCount });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

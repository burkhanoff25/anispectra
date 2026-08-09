import { NextRequest, NextResponse } from "next/server";
import { AnimeService } from "@/lib/api/anime.service";
import { prisma } from "@/server/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify Vercel Cron Request
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In local dev we can allow without secret if CRON_SECRET is not set, 
      // but on production we enforce it.
      if (process.env.NODE_ENV === "production") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("[CRON_ERROR] operation=telegramUpdates status=500 url=/api/cron/telegram-updates message=Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in cron");
      return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
    }

    // 2. Fetch latest releases
    const releases = await AnimeService.getLatestReleases(10);
    if (!releases || releases.length === 0) {
      return NextResponse.json({ success: true, message: "No releases found" });
    }

    // 3. Get last notified release ID from DB
    const settingKey = "last_notified_release_id";
    const lastNotified = await prisma.systemSetting.findUnique({
      where: { key: settingKey }
    });

    const lastId = lastNotified?.value;
    
    // Reverse the list so we send the oldest new ones first
    const newReleases = [];
    for (const release of releases) {
      if (String(release.id) === lastId) {
        break; // we reached the point we already processed
      }
      newReleases.unshift(release);
    }

    if (newReleases.length === 0) {
      return NextResponse.json({ success: true, message: "No new releases to send" });
    }

    // 4. Send messages to Telegram
    for (const release of newReleases) {
      const title = AnimeService.displayName(release);
      const url = `https://anispectra.uz/anime/${release.alias || release.id}`;
      const img = AnimeService.posterUrl(release.poster?.src);
      
      let text = `🔥 <b>Новая серия: ${title}</b>\n\n`;
      if (release.description) {
        text += `${release.description.slice(0, 150)}...\n\n`;
      }
      text += `👉 <a href="${url}">Смотреть на сайте</a>\n\n`;
      text += `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | 🛠 <a href="https://t.me/anispectra_support_bot">Бот поддержки</a>`;

      const telegramApiUrl = img 
        ? `https://api.telegram.org/bot${botToken}/sendPhoto` 
        : `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const payload: Record<string, unknown> = {
        chat_id: chatId,
        parse_mode: "HTML",
      };

      if (img) {
        payload.photo = img;
        payload.caption = text;
      } else {
        payload.text = text;
        payload.link_preview_options = { is_disabled: true };
      }

      const response = await fetch(telegramApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`[TELEGRAM_ERROR] operation=sendNotification status=${response.status} url=${img ? '/sendPhoto' : '/sendMessage'} message=${errorData}`);
        // Continue to the next one, but this one failed
      }
      
      // Wait slightly between messages to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 5. Update last notified ID in DB
    const latestRelease = newReleases[newReleases.length - 1];
    await prisma.systemSetting.upsert({
      where: { key: settingKey },
      update: { value: String(latestRelease.id) },
      create: { key: settingKey, value: String(latestRelease.id) }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${newReleases.length} notifications`,
      sentCount: newReleases.length
    });

  } catch (error) {
    console.error(`[API_ERROR] operation=cronTelegramUpdates status=500 url=/api/cron/telegram-updates message=${error instanceof Error ? error.message : "Unknown error"}`);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

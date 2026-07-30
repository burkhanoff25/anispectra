import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCron() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
      return;
    }

    const res = await fetch("https://anilibria.top/api/v1/anime/releases/latest?limit=1");
    const releases = await res.json();
    if (!releases || releases.length === 0) {
      console.log("No releases found");
      return;
    }

    const settingKey = "last_notified_release_id";
    const lastNotified = await prisma.systemSetting.findUnique({
      where: { key: settingKey }
    });
    
    // For manual test, let's just send the very latest one
    const release = releases[0];
    
    if (lastNotified?.value === String(release.id)) {
        console.log("Already notified about this release");
        return;
    }

    const title = release.name?.main || release.name?.english || "Без названия";
    const url = `https://anispectra.uz/anime/${release.alias || release.id}`;
    let img = null;
    if (release.poster?.src) {
        const src = release.poster.src;
        img = src.startsWith("http") ? src : `https://anilibria.top${src.startsWith("/") ? "" : "/"}${src}`;
    }
    
    let text = `🔥 <b>Yangi qism: ${title}</b>\n\n`;
    if (release.description) {
      text += `${release.description.slice(0, 150)}...\n\n`;
    }
    text += `👉 <a href="${url}">Saytda ko'rish</a>\n\n`;
    text += `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | 🛠 <a href="https://t.me/anispectra_support_bot">Yordam Bot</a>`;

    const telegramApiUrl = img 
      ? `https://api.telegram.org/bot${botToken}/sendPhoto` 
      : `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload: any = {
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
      console.error(`Failed to send telegram message for ${title}:`, errorData);
    } else {
        console.log("Message sent!");
        await prisma.systemSetting.upsert({
            where: { key: settingKey },
            update: { value: String(release.id) },
            create: { key: settingKey, value: String(release.id) }
        });
    }

  } catch (error) {
    console.error("Cron Telegram Error:", error);
  }
}

runCron().then(() => console.log("Done"));

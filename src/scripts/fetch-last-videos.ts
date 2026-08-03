import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION || "");
const targetChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID || "";
const SOURCE_CHANNEL = "anivaultik";
const VIDEO_LIMIT = 10;

if (!apiId || !apiHash || !targetChatId) {
  console.error("❌ .env da kerakli o'zgaruvchilar yo'q!");
  process.exit(1);
}

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

// Anispectra brendingi bilan caption yaratish
function buildCaption(originalCaption: string): string {
  // Manba kanalning o'z caption-ini tozalash (manba havolalarni olib tashlash)
  let cleaned = originalCaption
    .replace(/@[a-zA-Z0-9_]+/g, "")      // Boshqa kanal @taglarini olib tashlash
    .replace(/t\.me\/[^\s]+/gi, "")       // t.me havolalarini olib tashlash
    .replace(/https?:\/\/[^\s]+/gi, "")   // Barcha URL larni olib tashlash
    .trim();

  // Anispectra brendingi bilan yangi caption
  const caption =
    (cleaned ? `${cleaned}\n\n` : "") +
    `🌐 <a href="https://anispectra.uz">anispectra.uz</a> — barcha anime bir joyda\n` +
    `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | ` +
    `🛠 <a href="https://t.me/anispectra_support_bot">Qo'llab-quvvatlash</a>`;

  return caption;
}

async function fetchAndSendLastVideos() {
  console.log("🚀 Ulanilmoqda...");
  await client.connect();
  console.log("✅ Ulandi.\n");

  const sourceEntity = await client.getEntity(SOURCE_CHANNEL);
  const targetEntity  = await client.getEntity(targetChatId);
  console.log(`📡 Manba kanal: @${SOURCE_CHANNEL}`);
  console.log(`📌 Maqsadli kanal: ${(targetEntity as any).title || targetChatId}\n`);

  // Oxirgi 100 ta xabar
  console.log(`🔍 @${SOURCE_CHANNEL} dan oxirgi xabarlar yuklanmoqda...`);
  const messages = await client.getMessages(sourceEntity, { limit: 100 });

  // Faqat media bo'lgan xabarlarni filtrlash
  const mediaMessages = messages.filter((msg: any) => {
    return msg.media && (
      msg.media.className === "MessageMediaDocument" ||
      msg.media.className === "MessageMediaPhoto" ||
      msg.media?.document ||
      msg.media?.photo
    );
  });

  console.log(`🎬 Jami media xabarlar: ${mediaMessages.length}`);

  // Oxirgi VIDEO_LIMIT ta (eng yangisidan eskisiga)
  const lastVideos = mediaMessages.slice(0, VIDEO_LIMIT).reverse();

  console.log(`\n📤 ${lastVideos.length} ta xabar Anispectra brendingi bilan yuborilmoqda...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < lastVideos.length; i++) {
    const msg = lastVideos[i] as any;
    const num = i + 1;
    const originalCaption = msg.text || msg.message || "";
    const mediaType = msg.media?.className || "Media";

    console.log(`[${num}/${lastVideos.length}] ID: ${msg.id} | Tur: ${mediaType}`);
    if (originalCaption) {
      console.log(`   📝 Asl caption: ${originalCaption.slice(0, 60)}...`);
    }

    const newCaption = buildCaption(originalCaption);
    console.log(`   ✍️  Yangi caption: ${newCaption.slice(0, 80)}...`);

    try {
      // Forward emas — to'g'ridan-to'g'ri media bilan yuborish (manba ko'rinmaydi)
      await (client as any).sendFile(targetChatId, {
        file: msg.media,
        caption: newCaption,
        parseMode: "html",
        // noForwards: true, // Ba'zi versiyalarda ishlaydi
      });

      console.log(`   ✅ Anispectra brendingi bilan yuborildi!\n`);
      success++;
    } catch (err: any) {
      console.error(`   ❌ Xato: ${err?.message}\n`);
      // Fallback: sendMessage bilan
      try {
        await client.sendMessage(targetChatId, {
          message: newCaption,
          file: msg.media,
          parseMode: "html",
        });
        console.log(`   ✅ Fallback bilan yuborildi!\n`);
        success++;
      } catch (fallbackErr: any) {
        console.error(`   ❌ Fallback ham xato: ${fallbackErr?.message}\n`);
        failed++;
      }
    }

    // Telegram rate limit uchun kutish
    if (i < lastVideos.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log("═══════════════════════════════════");
  console.log(`✅ Muvaffaqiyatli: ${success} ta`);
  if (failed > 0) console.log(`❌ Xato: ${failed} ta`);
  console.log("═══════════════════════════════════\n");

  await client.disconnect();
  console.log("👋 Ulash yopildi.");
}

fetchAndSendLastVideos().catch((err) => {
  console.error("❌ Kritik xato:", err);
  process.exit(1);
});

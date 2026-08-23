/* eslint-disable no-console, @typescript-eslint/no-explicit-any, prefer-const, @typescript-eslint/ban-ts-comment */
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION || "");
const targetChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID || "";
const SOURCE_CHANNELS = ["anivaultik", "AniLibria_TV"];
const VIDEO_LIMIT = 100;

if (!apiId || !apiHash || !targetChatId) {
  console.error("❌ .env da kerakli o'zgaruvchilar yo'q!");
  process.exit(1);
}

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

// Anispectra brendingi bilan caption yaratish
function buildCaption(originalCaption: string): string {
  let cleaned = originalCaption
    .replace(/@[a-zA-Z0-9_]+/g, "")      
    .replace(/t\.me\/[^\s]+/gi, "")       
    .replace(/https?:\/\/[^\s]+/gi, "")   
    .trim();

  const caption =
    (cleaned ? `${cleaned}\n\n` : "") +
    `🌐 <a href="https://anispectra.uz">anispectra.uz</a> — все аниме в одном месте\n` +
    `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | ` +
    `🛠 <a href="https://t.me/anispectra_support_bot">Поддержка</a>`;

  return caption;
}

async function fetchAndSendLastVideos() {
  console.log("🚀 Ulanilmoqda...");
  await client.connect();
  console.log("✅ Ulandi.\n");

  const targetEntity = await client.getEntity(targetChatId);
  console.log(`📌 Maqsadli kanal: ${(targetEntity as any).title || targetChatId}\n`);

  for (const source of SOURCE_CHANNELS) {
    try {
      const sourceEntity = await client.getEntity(source);
      console.log(`\n===========================================`);
      console.log(`📡 Manba kanal: @${source}`);
      console.log(`===========================================`);
      
      console.log(`🔍 @${source} dan oxirgi xabarlar yuklanmoqda...`);
      // Videolar topilishi ehtimolini oshirish uchun 200 ta xabarni tekshiramiz
      const messages = await client.getMessages(sourceEntity, { limit: 200 });

      // Faqat media bo'lgan xabarlarni filtrlash
      const mediaMessages = messages.filter((msg: any) => {
        return msg.media && (
          msg.media.className === "MessageMediaDocument" ||
          msg.media.className === "MessageMediaPhoto" ||
          msg.media?.document ||
          msg.media?.photo
        );
      });

      console.log(`🎬 Jami media xabarlar topildi: ${mediaMessages.length}`);

      // Oxirgi VIDEO_LIMIT ta (eng yangisidan eskisiga)
      const lastVideos = mediaMessages.slice(0, VIDEO_LIMIT).reverse();

      console.log(`📤 ${lastVideos.length} ta xabar Anispectra brendingi bilan yuborilmoqda...\n`);

      let success = 0;
      let failed = 0;

      for (let i = 0; i < lastVideos.length; i++) {
        const msg = lastVideos[i] as any;
        const num = i + 1;
        const originalCaption = msg.text || msg.message || "";
        const mediaType = msg.media?.className || "Media";

        console.log(`[@${source} - ${num}/${lastVideos.length}] ID: ${msg.id} | Tur: ${mediaType}`);
        
        const newCaption = buildCaption(originalCaption);

        try {
          await (client as any).sendFile(targetChatId, {
            file: msg.media,
            caption: newCaption,
            parseMode: "html",
          });

          console.log(`   ✅ Yuborildi!`);
          success++;
        } catch (err: any) {
          if (err.message && err.message.includes("FLOOD_WAIT")) {
             console.error(`   🛑 FLOOD WAIT! Telegram limitiga tushdik. Skriptni to'xtatish kerak.`);
             break;
          }
          console.error(`   ❌ Xato: ${err?.message}`);
          
          try {
            await client.sendMessage(targetChatId, {
              message: newCaption,
              file: msg.media,
              parseMode: "html",
            });
            console.log(`   ✅ Fallback bilan yuborildi!`);
            success++;
          } catch (fallbackErr: any) {
            console.error(`   ❌ Fallback ham xato: ${fallbackErr?.message}`);
            failed++;
          }
        }

        // Xavfsiz bo'lishi uchun 3 soniya kutish
        if (i < lastVideos.length - 1) {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }

      console.log(`\n📊 @${source} uchun natija: Muvaffaqiyatli: ${success} ta, Xato: ${failed} ta`);
    } catch (e: any) {
      console.error(`Kanalni tekshirishda xatolik (@${source}):`, e.message);
    }
  }

  await client.disconnect();
  console.log("\n👋 Ulash yopildi.");
}

fetchAndSendLastVideos().catch((err) => {
  console.error("❌ Kritik xato:", err);
  process.exit(1);
});

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import * as dotenv from "dotenv";
import * as path from "path";

// .env faylini to'g'ri yuklash
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION || "");

// Kanal CHAT_ID: -100 prefixi bilan to'g'ri format
const targetChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID || "";

if (!apiId || !apiHash || !targetChatId) {
  console.error("❌ TELEGRAM_API_ID, TELEGRAM_API_HASH, va TELEGRAM_CHAT_ID/.TELEGRAM_CHANNEL_ID kerak!");
  process.exit(1);
}

// Kuzatiladigan kanal usernamelari (@ belgisisiz)
const SOURCE_CHANNELS = [
  "anivaultik",
  "AniLibria_TV",
];

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
  retryDelay: 2000,
});

// Anispectra brendingi bilan caption yaratish
function buildCaption(originalCaption: string): string {
  let cleaned = originalCaption
    .replace(/@[a-zA-Z0-9_]+/g, "")
    .replace(/t\.me\/[^\s]+/gi, "")
    .replace(/https?:\/\/[^\s]+/gi, "")
    .trim();

  return (
    (cleaned ? `${cleaned}\n\n` : "") +
    `🌐 <a href="https://anispectra.uz">anispectra.uz</a> — barcha anime bir joyda\n` +
    `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | ` +
    `🛠 <a href="https://t.me/anispectra_support_bot">Qo'llab-quvvatlash</a>`
  );
}

async function resolveChannelEntities() {

  const entities: any[] = [];
  for (const username of SOURCE_CHANNELS) {
    try {
      const entity = await client.getEntity(username);
      entities.push(entity);
      console.log(`✅ Kanal topildi: @${username} (id: ${(entity as any).id})`);
    } catch (err) {
      console.error(`❌ Kanal topilmadi: @${username}`, err);
    }
  }
  return entities;
}

async function main() {
  console.log("🚀 Telegram Userbot ishga tushmoqda...");

  await client.start({
    phoneNumber: async () => await input.text("📱 Telefon raqamingizni kiriting: "),
    password: async () => await input.text("🔐 2FA parolini kiriting (agar mavjud bo'lsa): "),
    phoneCode: async () => await input.text("📨 SMS kodini kiriting: "),
    onError: (err) => console.error("Auth xatosi:", err),
  });

  console.log("✅ Telegram ga ulanildi.");

  const savedSession = (client.session.save() as unknown) as string;
  if (savedSession && savedSession !== process.env.TELEGRAM_STRING_SESSION) {
    console.log("\n⚠️ --- MUHIM ---");
    console.log("Ushbu satrni .env fayliga TELEGRAM_STRING_SESSION sifatida saqlang:");
    console.log(savedSession);
    console.log("-----------------\n");
  }

  // Maqsadli kanalga ulanishni tekshirish
  try {
    const targetEntity = await client.getEntity(targetChatId);
    console.log(`✅ Maqsadli kanal topildi: ${(targetEntity as any).title || targetChatId}`);
  } catch (err) {
    console.error(`❌ Maqsadli kanal topilmadi (${targetChatId}):`, err);
    console.error("TELEGRAM_CHAT_ID ni tekshiring! Kanal uchun -100XXXXXXXXXX formatida bo'lishi kerak.");
  }

  // Kanallarni oldindan resolve qilish
  const channelEntities = await resolveChannelEntities();
  if (channelEntities.length === 0) {
    console.error("❌ Hech qanday kanal resolve qilinmadi. Bot to'xtatildi.");
    return;
  }

  // Faqat maqsadli kanallardan xabar tinglash
  client.addEventHandler(async (event: NewMessageEvent) => {
    const message = event.message;

    if (!message) return;

    // Chat ma'lumotlarini olish
    let chat: any;
    try {
      chat = await message.getChat();
    } catch {
      return;
    }

    const chatUsername: string = (chat?.username || "").toLowerCase();
    const sourceUsernames = SOURCE_CHANNELS.map(u => u.toLowerCase());

    // Faqat maqsadli kanallardan
    if (!chatUsername || !sourceUsernames.includes(chatUsername)) {
      return;
    }

    console.log(`\n📨 @${chat.username} kanalidan yangi xabar keldi`);

    // "anivaultik" uchun: faqat media bo'lgan xabarlar (anime postlari)
    if (chatUsername === "anivaultik") {
      if (!message.media) {
        console.log("⏭ Mediasiz xabar o'tkazib yuborildi (anivaultik).");
        return;
      }
    }

    try {
      // Forward EMAS — Anispectra nomi bilan o'z xabari sifatida yuborish
      console.log(`📤 Anispectra brendingi bilan yuborilmoqda...`);

      const originalCaption = message.text || message.message || "";
      const caption = buildCaption(originalCaption);

      if (message.media) {
        // Media bilan yuborish (video, rasm)
        await (client as any).sendFile(targetChatId, {
          file: message.media,
          caption: caption,
          parseMode: "html",
        });
      } else {
        // Faqat matn
        await client.sendMessage(targetChatId, {
          message: caption,
          parseMode: "html",
        });
      }

      console.log("✅ Anispectra brendingi bilan yuborildi!");
    } catch (err: any) {
      console.error("⚠️ Yuborishda xato:", err?.message);
      // Fallback: sendMessage usuli
      try {
        const text = buildCaption(message.text || "");
        await client.sendMessage(targetChatId, {
          message: text,
          ...(message.media ? { file: message.media } : {}),
          parseMode: "html",
        });
        console.log("✅ Fallback bilan yuborildi!");
      } catch (fallbackErr) {
        console.error("❌ Fallback ham xato:", fallbackErr);
      }
    }
  }, new NewMessage({}));

  console.log(`\n👂 Kuzatilayotgan kanallar: ${SOURCE_CHANNELS.map(c => "@" + c).join(", ")}`);
  console.log(`📌 Maqsadli kanal: ${targetChatId}`);
  console.log("⏳ Yangi xabarlar kutilmoqda...\n");
}

main().catch(console.error);

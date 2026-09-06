import { bot } from "@/server/bot/bot";
import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });

console.log("Starting AniSpectra Telegram Bot (Long Polling)...");

// Removed dummy server as Next.js handles the web service port

bot.api.deleteWebhook({ drop_pending_updates: true })
  .then(() => {
    console.log("Webhook deleted, starting polling...");
    
    const startPolling = async () => {
      try {
        await bot.start({
          onStart: (botInfo) => {
            console.log(`Bot @${botInfo.username} successfully started!`);
          },
        });
      } catch (err: any) {
        if (err.error_code === 409) {
          console.warn("409 Conflict: Boshqa bot instansi ishlayapti (ehtimol Render'da eski versiya yopilmoqda). 10 soniyadan so'ng qayta urinib ko'ramiz...");
          setTimeout(startPolling, 10000);
        } else {
          console.error("Botni ishga tushirishda xatolik:", err);
        }
      }
    };

    startPolling();
  })
  .catch((err) => {
    console.error("Failed to delete webhook or start polling:", err);
  });

// Graceful shutdown (Render eski instansni yopganda botni to'xtatadi)
process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());

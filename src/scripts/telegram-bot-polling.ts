import { bot } from "@/server/bot/bot";
import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });

console.log("Starting AniSpectra Telegram Bot (Long Polling)...");

// Removed dummy server as Next.js handles the web service port

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} successfully started!`);
  },
});

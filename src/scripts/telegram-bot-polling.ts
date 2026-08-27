import { bot } from "@/server/bot/bot";
import * as dotenv from "dotenv";
import * as path from "path";
import * as http from "http";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: false });

console.log("Starting AniSpectra Telegram Bot (Long Polling)...");

// Dummy HTTP server for Render/Railway health checks
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running!");
});
server.listen(port, () => {
  console.log(`Dummy health check server listening on port ${port}`);
});

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} successfully started!`);
  },
});

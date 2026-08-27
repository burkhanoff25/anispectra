import dotenv from 'dotenv';
dotenv.config();

import { bot } from '../server/bot/bot';

console.log("Starting AniSpectra Telegram Bot (Long Polling)...");

bot.start({
  onStart: (botInfo) => {
    console.log(`Bot @${botInfo.username} successfully started!`);
  }
});

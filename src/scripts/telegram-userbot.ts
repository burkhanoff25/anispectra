import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";
import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import * as dotenv from "dotenv";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession(process.env.TELEGRAM_STRING_SESSION || "");
const targetChatId = process.env.TELEGRAM_CHAT_ID || "";

if (!apiId || !apiHash || !targetChatId) {
  console.error("Please set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_CHAT_ID in .env");
  process.exit(1);
}

const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

async function main() {
  console.log("Starting Telegram Userbot...");
  
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password (if 2FA): "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  const session = (client.session.save() as unknown) as string;
  if (session && session !== process.env.TELEGRAM_STRING_SESSION) {
    console.log("\n--- IMPORTANT ---");
    console.log("Save this string in your .env file as TELEGRAM_STRING_SESSION:");
    console.log(session);
    console.log("-----------------\n");
  }

  const sourceChannels = ["anivaultik", "AniLibria_TV"];

  client.addEventHandler(async (event: NewMessageEvent) => {
    const message = event.message;
    
    if (!message || !message.chat) return;
    
    // Attempt to get username of the channel
    const chat: any = await message.getChat();
    const chatUsername = chat?.username;

    if (!chatUsername || !sourceChannels.includes(chatUsername)) {
      return; // Not from our target channels
    }

    console.log(`New message from @${chatUsername}`);

    // If it's anivaultik, we only want anime. Let's assume anime posts have video/document media.
    if (chatUsername === "anivaultik") {
      if (!message.media) {
        console.log("Ignoring message from anivaultik because it has no media (not an anime).");
        return;
      }
    }

    try {
      let text = message.text || "";
      // Optional: modify text here to remove source links or add your own tags
      text += `\n\n💬 @Anispectra_uz`;

      console.log(`Forwarding message to ${targetChatId}...`);
      
      await client.sendMessage(targetChatId, {
        message: text,
        file: message.media, // Re-uses the file_id, no download needed!
      });
      
      console.log("Successfully forwarded!");
    } catch (err) {
      console.error("Error forwarding message:", err);
    }
  }, new NewMessage({}));

  console.log("Listening for new messages...");
}

main().catch(console.error);

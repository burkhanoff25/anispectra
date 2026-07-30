import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Simple admin check: Only authenticated users can send.
    // In a real app, you'd check if user.role === 'ADMIN'
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, url, imageUrl, message } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Telegram bot token or chat ID is missing in environment variables." }, { status: 500 });
    }

    let text = `<b>🎬 ${title}</b>\n\n`;
    if (message) {
      text += `${message}\n\n`;
    }
    text += `👉 <a href="${url}">Ko'rish uchun bosing</a>`;

    // Send Photo with caption
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json({ error: "Failed to send message to Telegram", details: data }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Notification sent successfully!" });

  } catch (error) {
    console.error("Error in Telegram Notify API:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Check if it's a message
    if (update.message) {
      const { message } = update;

      // We only care if this message is a reply to our bot's message
      if (message.reply_to_message && message.text) {
        const repliedMessageId = message.reply_to_message.message_id;
        const adminText = message.text;

        // Find the ticket that has this telegramMessageId
        const ticket = await prisma.supportTicket.findFirst({
          where: { telegramMessageId: repliedMessageId },
          include: { user: true }
        });

        if (ticket) {
          // Create the reply in our database
          await prisma.supportReply.create({
            data: {
              ticketId: ticket.id,
              message: adminText,
            }
          });

          // Update ticket status
          await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: { status: 'REPLIED' }
          });

          // Optional: Send a confirmation to admin that reply was sent
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: message.chat.id,
                text: `✅ Ответ доставлен пользователю ${ticket.user.name || ticket.user.email}.`,
                reply_to_message_id: message.message_id,
              }),
            });
          }
        }
      }
    }

    // Always return 200 OK to Telegram so they don't retry
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ ok: true }); // Return 200 even on error to stop Telegram from retrying
  }
}

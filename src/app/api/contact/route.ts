import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/server/db/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram bot token or chat ID is missing');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // First create the ticket in the database
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        message: message,
      }
    });

    const text = `
📩 <b>Новое обращение #${ticket.id}</b>

👤 <b>Пользователь:</b> ${session.user.name || 'Без имени'}
📧 <b>Email:</b> ${session.user.email}

💬 <b>Сообщение:</b>
${message}

<i>Ответьте на это сообщение (Reply), чтобы отправить ответ пользователю.</i>
`;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Telegram API Error:', errorData);
      return NextResponse.json({ error: 'Failed to send message to Telegram' }, { status: 500 });
    }

    const data = await response.json();
    
    // Save the telegramMessageId
    if (data.result && data.result.message_id) {
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { telegramMessageId: data.result.message_id }
      });
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

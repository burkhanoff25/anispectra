import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Введите корректный email' }, { status: 400 });
    }

    // Check rate limit: max 3 attempts per 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const attemptsCount = await prisma.otpAttempt.count({
      where: {
        email,
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (attemptsCount >= 3) {
      return NextResponse.json({ 
        error: "Вы исчерпали лимит (3 раза в день). Пожалуйста, попробуйте завтра." 
      }, { status: 429 });
    }

    // Record this attempt
    await prisma.otpAttempt.create({
      data: { email }
    });

    // Generate a 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // Expires in 15 minutes
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    // Clear old tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    });

    // Save to DB
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires
      }
    });

    // Send via Resend
    // Note: With a free Resend account and without a verified domain, 
    // you can only send emails to the email address you registered Resend with.
    const { error } = await resend.emails.send({
      from: 'Anispectra <onboarding@resend.dev>',
      to: [email],
      subject: 'Код авторизации Anispectra',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #0d0f14; color: #e1e3e6; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #1a1d24;">
          <h2 style="color: #6366f1; text-align: center; font-size: 24px;">Anispectra</h2>
          <p style="text-align: center; color: #8a8d93;">Ваш код для входа на сайт:</p>
          <div style="background-color: #1a1d24; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; margin: 0; color: #ffffff;">${code}</h1>
          </div>
          <p style="text-align: center; font-size: 12px; color: #8a8d93;">Код действителен в течение 15 минут.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Не удалось отправить письмо. Убедитесь, что ваш email верифицирован в Resend (на бесплатном тарифе).' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Send OTP Error:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

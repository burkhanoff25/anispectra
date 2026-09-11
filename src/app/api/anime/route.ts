import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function GET() {
  try {
    const animes = await prisma.anime.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { episodes: true }
        }
      }
    });
    return NextResponse.json(animes);
  } catch (error) {
    console.error('[API_ERROR] operation=getAnimes error=', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to fetch animes' }, { status: 500 });
  }
}

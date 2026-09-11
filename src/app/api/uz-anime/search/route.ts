import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { AniHubScraper } from '@/services/anihub-scraper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const online = searchParams.get('online') === 'true';

  try {
    // 1. Search local DB first
    let animes = await prisma.anime.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        episodes: {
          orderBy: { episode_number: 'asc' },
        },
      },
      take: 60,
    });

    // 2. If online search requested and query exists, search AniHub and import
    if (online && q) {
      const searchLinks = await AniHubScraper.searchAnime(q);
      const topLinks = searchLinks.slice(0, 5); // Take top 5 search matches

      for (const link of topLinks) {
        try {
          const details = await AniHubScraper.fetchAnimeDetails(link);
          if (!details || !details.title) continue;

          // Check if already in DB
          let existing = await prisma.anime.findFirst({
            where: { title: details.title },
          });

          if (!existing) {
            existing = await prisma.anime.create({
              data: {
                title: details.title,
                poster: details.poster,
                description: details.description,
                release_year: details.release_year,
              },
            });

            // Insert episodes
            if (details.episodes && details.episodes.length > 0) {
              await prisma.episode.createMany({
                data: details.episodes.map((ep) => ({
                  anime_id: existing!.id,
                  episode_number: ep.episode_number,
                  title: ep.title,
                  stream_url: ep.stream_url,
                })),
                skipDuplicates: true,
              });
            }
          }
        } catch (scrapeErr) {
          console.error(`Error importing search result ${link}:`, scrapeErr);
        }
      }

      // Re-fetch from DB after import
      animes = await prisma.anime.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          episodes: {
            orderBy: { episode_number: 'asc' },
          },
        },
      });
    }

    return NextResponse.json({ success: true, count: animes.length, animes });
  } catch (error: any) {
    console.error('Uz-anime search API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

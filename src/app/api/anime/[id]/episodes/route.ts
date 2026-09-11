import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const anime = await prisma.anime.findUnique({
      where: { id },
    });
    
    if (!anime) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }

    const episodes = await prisma.episode.findMany({
      where: { anime_id: id },
      orderBy: { episode_number: 'asc' }
    });

    // Proxy the stream URL through our Express logic built in Phase 2
    const proxiedEpisodes = episodes.map(ep => {
      const proxyUrl = `/api/proxy/stream?url=${encodeURIComponent(ep.stream_url)}`;
      return {
        ...ep,
        original_stream_url: ep.stream_url,
        stream_url: proxyUrl
      };
    });

    return NextResponse.json({
      anime,
      episodes: proxiedEpisodes
    });
  } catch (error) {
    console.error(`[API_ERROR] operation=getAnimeEpisodes id=${params.id} error=${error instanceof Error ? error.message : error}`);
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
  }
}

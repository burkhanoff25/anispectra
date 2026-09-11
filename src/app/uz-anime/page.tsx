import React from 'react';
import { prisma } from '@/server/db/client';
import UzAnimeHero from '@/components/UzAnimeHero';
import UzAnimeCatalog from '@/components/UzAnimeCatalog';
import FilmDivider from '@/components/FilmDivider';

export const revalidate = 0;

export default async function UzAnimePage() {
  const animes = await prisma.anime.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      episodes: {
        orderBy: { episode_number: 'asc' }
      }
    }
  });

  return (
    <div className="min-h-screen bg-ink">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {animes.length > 0 && (
          <UzAnimeHero anime={animes[0]} />
        )}

        <UzAnimeCatalog initialAnimes={animes} />
      </div>
      <FilmDivider />
    </div>
  );
}


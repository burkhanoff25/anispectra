import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/server/db/client';
import UzAnimePlayer from '@/components/UzAnimePlayer';
import DisqusComments from '@/components/DisqusComments';
import FilmDivider from '@/components/FilmDivider';

export const revalidate = 0;

interface PageProps {
  params: { id: string };
  searchParams: { ep?: string };
}

export default async function AnimeDetailsPage({ params, searchParams }: PageProps) {
  const anime = await prisma.anime.findUnique({
    where: { id: params.id },
    include: {
      episodes: {
        orderBy: { episode_number: 'asc' }
      }
    }
  });

  if (!anime) {
    notFound();
  }

  // Determine current episode to play
  const selectedEpNumber = searchParams.ep ? parseInt(searchParams.ep, 10) : (anime.episodes[0]?.episode_number || 1);
  const currentEpisode = anime.episodes.find((e: any) => e.episode_number === selectedEpNumber) || anime.episodes[0];

  const posterUrl = anime.poster
    ? `/api/proxy/image?url=${encodeURIComponent(anime.poster)}`
    : null;

  return (
    <div className="min-h-screen bg-ink">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-mist mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-paper transition">
            Bosh sahifa
          </Link>
          <span>/</span>
          <Link href="/uz-anime" className="hover:text-paper transition">
            O'zbekcha Anime
          </Link>
          <span>/</span>
          <span className="text-paper font-medium truncate max-w-xs sm:max-w-md">
            {anime.title}
          </span>
        </nav>

        {/* Anime Title & Badges */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-paper font-display mb-3">
              {anime.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-green-400/20 border border-green-400/40 px-3 py-1 text-xs font-bold text-green-400">
                O'zbek tilida
              </span>
              {anime.release_year && (
                <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-mist">
                  Yil: {anime.release_year}
                </span>
              )}
              <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-mist">
                Jami: {anime.episodes.length} qism
              </span>
              {anime.genres && (
                anime.genres.split(",").map((g: string) => (
                  <span
                    key={g.trim()}
                    className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-mist"
                  >
                    {g.trim()}
                  </span>
                ))
              )}
            </div>
          </div>

          <Link
            href="/uz-anime"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-4 py-2 text-xs font-semibold text-mist hover:text-paper hover:border-green-400/50 transition self-start md:self-auto"
          >
            ← Katalogga qaytish
          </Link>
        </div>

        {/* Main Grid: Player on left, Episodes on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Player & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player */}
            {currentEpisode ? (
              <div className="space-y-3">
                <UzAnimePlayer 
                  url={currentEpisode.stream_url} 
                  poster={posterUrl || undefined}
                  title={`${anime.title} - ${currentEpisode.episode_number}-qism`}
                />
                
                <div className="flex items-center justify-between p-4 rounded-2xl border border-line bg-panel">
                  <div>
                    <h3 className="text-lg font-bold text-paper">
                      {currentEpisode.episode_number}-qism {currentEpisode.title ? `: ${currentEpisode.title}` : ''}
                    </h3>
                    <span className="text-xs text-mist">
                      {anime.title} • Uzbek dublyaj
                    </span>
                  </div>

                  {/* Previous / Next episode quick buttons */}
                  <div className="flex gap-2">
                    {currentEpisode.episode_number > 1 && (
                      <Link
                        href={`/uz-anime/${anime.id}?ep=${currentEpisode.episode_number - 1}`}
                        className="rounded-lg border border-line bg-ink px-3 py-1.5 text-xs font-medium text-mist hover:text-paper transition"
                      >
                        ← Oldingi
                      </Link>
                    )}
                    {currentEpisode.episode_number < anime.episodes.length && (
                      <Link
                        href={`/uz-anime/${anime.id}?ep=${currentEpisode.episode_number + 1}`}
                        className="rounded-lg bg-gradient-to-r from-green-500 to-yellow-500 px-3 py-1.5 text-xs font-bold text-ink hover:opacity-90 transition shadow-glow"
                      >
                        Keyingi →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-panel rounded-2xl flex items-center justify-center border border-line text-mist">
                Hozircha qismlar mavjud emas
              </div>
            )}

            {/* Description & Poster Card */}
            <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-6">
                {posterUrl && (
                  <div className="relative w-36 aspect-[2/3] shrink-0 overflow-hidden rounded-xl border border-line hidden sm:block">
                    <Image
                      src={posterUrl}
                      alt={anime.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-paper mb-3">Tavsif</h2>
                  <p className="text-sm text-mist leading-relaxed whitespace-pre-line">
                    {anime.description || "Ushbu anime uchun tavsif qo'shilmagan."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Episode Selector */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-paper">
                  Qismlar ({anime.episodes.length})
                </h2>
                <span className="text-xs text-mist">O'zbekcha tarjima</span>
              </div>
              
              {anime.episodes.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[540px] overflow-y-auto pr-2 custom-scrollbar">
                  {anime.episodes.map((ep: any) => {
                    const isActive = ep.episode_number === currentEpisode?.episode_number;
                    return (
                      <Link
                        key={ep.id}
                        href={`/uz-anime/${anime.id}?ep=${ep.episode_number}`}
                        className={`
                          flex items-center justify-between p-3 rounded-xl transition-all border text-sm
                          ${isActive 
                            ? 'bg-green-400/15 border-green-400 text-green-400 font-bold shadow-[0_0_12px_rgba(34,197,94,0.25)]' 
                            : 'bg-ink/70 border-line text-mist hover:border-green-400/50 hover:bg-line hover:text-paper'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-line'}`} />
                          <span>{ep.episode_number}-qism</span>
                        </div>
                        {ep.title ? (
                          <span className="text-xs truncate ml-2 opacity-70 max-w-[130px]">
                            {ep.title}
                          </span>
                        ) : (
                          <span className="text-xs opacity-60">
                            {isActive ? 'Ijro etilmoqda' : 'Tomosha'}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-mist text-center py-6">Qismlar topilmadi</p>
              )}
            </div>
          </div>

        </div>

        {/* Disqus Comments */}
        <div className="mt-12">
          <DisqusComments 
            url={`https://anispectra.uz/uz-anime/${anime.id}`}
            identifier={`uz-anime-${anime.id}`}
            title={anime.title}
          />
        </div>
      </div>
      <FilmDivider />
    </div>
  );
}


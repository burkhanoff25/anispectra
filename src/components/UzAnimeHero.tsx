"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import UzAnimePlayer from "./UzAnimePlayer";
import SpectraBar from "./SpectraBar";

interface Episode {
  id: string;
  episode_number: number;
  title?: string | null;
  stream_url: string;
}

interface Anime {
  id: string;
  title: string;
  poster?: string | null;
  description?: string | null;
  release_year?: number | null;
  episodes: Episode[];
}

export default function UzAnimeHero({ anime }: { anime: Anime }) {
  const [showPlayer, setShowPlayer] = useState(false);

  const posterUrl = anime.poster
    ? `/api/proxy/image?url=${encodeURIComponent(anime.poster)}`
    : null;

  const firstStream = anime.episodes[0]?.stream_url;

  return (
    <section className="relative mb-12 rounded-3xl overflow-hidden border border-line bg-panel/70 shadow-glow backdrop-blur-sm">
      {/* Background Poster Blur Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {posterUrl && (
          <Image
            src={posterUrl}
            alt={anime.title}
            fill
            className="object-cover opacity-25 blur-xl scale-110"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
      </div>

      <div className="relative p-6 sm:p-8 md:p-12 z-10">
        {showPlayer && firstStream ? (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  1-qism pleeri
                </span>
                <h3 className="text-xl font-bold text-paper">{anime.title}</h3>
              </div>
              <button
                onClick={() => setShowPlayer(false)}
                className="rounded-full border border-line bg-panel px-4 py-1.5 text-xs font-medium text-mist hover:text-paper transition"
              >
                ✕ Yopish
              </button>
            </div>
            
            <UzAnimePlayer 
              url={firstStream} 
              poster={posterUrl || undefined}
              title={`${anime.title} - 1-qism`}
            />

            <div className="flex justify-end pt-2">
              <Link
                href={`/uz-anime/${anime.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-yellow-400 px-5 py-2 text-xs font-bold text-ink transition hover:opacity-90 shadow-glow"
              >
                Barcha qismlar ({anime.episodes.length} ta) →
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
            {/* Poster Card */}
            <div className="relative w-44 sm:w-56 aspect-[2/3] shrink-0 overflow-hidden rounded-2xl border border-line shadow-glow hidden sm:block">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={anime.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-panel text-mist text-xs">
                  Rasm yo'q
                </div>
              )}
            </div>

            {/* Anime Info */}
            <div className="flex-1 text-center md:text-left">
              <SpectraBar className="mb-4 w-14 mx-auto md:mx-0" />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                O'zbek tilida dublyaj
              </p>
              <h2 className="font-display text-3xl font-black leading-tight text-paper sm:text-5xl text-balance">
                {anime.title}
              </h2>

              {anime.description && (
                <p className="mt-4 text-sm text-mist sm:text-base line-clamp-3 max-w-2xl leading-relaxed">
                  {anime.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {anime.release_year && (
                  <span className="rounded-full border border-line bg-panel/60 px-3 py-1 text-xs text-mist">
                    {anime.release_year}
                  </span>
                )}
                <span className="rounded-full border border-line bg-panel/60 px-3 py-1 text-xs text-mist">
                  {anime.episodes.length} qism
                </span>
                <span className="rounded-full border border-green-400/40 bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-400">
                  HD Player
                </span>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link
                  href={`/uz-anime/${anime.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-yellow-400 px-7 py-3 font-display text-sm font-bold text-ink shadow-glow transition hover:opacity-90"
                >
                  Tomosha qilish
                </Link>

                {firstStream && (
                  <button
                    onClick={() => setShowPlayer(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-6 py-3 font-display text-sm font-semibold text-mist hover:text-paper hover:border-green-400/50 transition"
                  >
                    ▶ Tezkor pleer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import PosterCard from "./PosterCard";

interface Episode {
  id: string;
  episode_number: number;
}

interface Anime {
  id: string;
  title: string;
  poster?: string | null;
  description?: string | null;
  release_year?: number | null;
  genres?: string | null;
  episodes: Episode[];
}

export default function UzAnimeCatalog({ initialAnimes }: { initialAnimes: Anime[] }) {
  const [animes] = useState<Anime[]>(initialAnimes);
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Extract all unique genres across all imported animes
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    animes.forEach((a) => {
      if (a.genres) {
        a.genres.split(",").forEach((g) => {
          const trimmed = g.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set).sort();
  }, [animes]);

  // Combined real-time filtering: search query + selected genre
  const filtered = useMemo(() => {
    return animes.filter((a) => {
      // 1. Genre filter
      if (selectedGenre) {
        if (!a.genres || !a.genres.toLowerCase().includes(selectedGenre.toLowerCase())) {
          return false;
        }
      }

      // 2. Search query filter
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchDesc = a.description && a.description.toLowerCase().includes(q);
        const matchGenre = a.genres && a.genres.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchGenre) return false;
      }

      return true;
    });
  }, [animes, query, selectedGenre]);

  return (
    <div className="mt-10">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-paper">
            O'zbekcha anime katalogi
          </h2>
          <p className="mt-1 text-sm text-mist">
            Barcha O'zbek tilidagi animelar — seriallar, filmlar va yangi fasllar ({filtered.length} ta).
          </p>
        </div>

        {/* Search Form */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Anime qidirish..."
            className="w-full rounded-full border border-line bg-panel px-4 py-2 pl-10 text-sm text-paper placeholder-mist outline-none focus:border-accent transition shadow-sm"
          />
          <svg
            className="absolute left-3.5 top-2.5 h-4 w-4 text-mist"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-2 text-xs text-mist hover:text-paper"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Genres Filter Pills */}
      {allGenres.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre("")}
            className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
              !selectedGenre
                ? "bg-gradient-to-r from-green-500 to-yellow-500 text-ink font-semibold shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                : "border border-line bg-panel/70 text-mist hover:text-white hover:border-line"
            }`}
          >
            Barcha janrlar
          </button>
          {allGenres.map((g) => {
            const isActive = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(isActive ? "" : g)}
                className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-green-500 to-yellow-500 text-ink font-semibold shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                    : "border border-line bg-panel/70 text-mist hover:text-white hover:border-line"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      )}


      {/* Anime Grid - Exact /anime layout: grid-cols-2 to lg:grid-cols-6 */}
      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-line bg-panel p-12 text-center">
          <p className="text-paper font-semibold">Hech qanday anime topilmadi</p>
          <p className="mt-1 text-xs text-mist">
            Boshqa janrni tanlab ko'ring yoki qidiruv orqali toping.
          </p>
          {selectedGenre && (
            <button
              onClick={() => setSelectedGenre("")}
              className="mt-3 rounded-full border border-line px-4 py-1.5 text-xs font-medium text-paper hover:bg-line transition"
            >
              Janr filtrini tozalash
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((anime) => {
            const posterSrc = anime.poster
              ? `/api/proxy/image?url=${encodeURIComponent(anime.poster)}`
              : null;

            const primaryGenre = anime.genres ? anime.genres.split(",")[0].trim() : null;
            const subtitle = `${anime.release_year ? anime.release_year + " • " : ""}${primaryGenre ? primaryGenre + " • " : ""}${anime.episodes.length} qism`;

            return (
              <PosterCard
                key={anime.id}
                href={`/uz-anime/${anime.id}`}
                title={anime.title}
                subtitle={subtitle}
                imageSrc={posterSrc}
                badge={anime.episodes.length > 0 ? `${anime.episodes.length} qism` : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

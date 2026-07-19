import Link from "next/link";
import PosterCard from "@/components/PosterCard";
import EmptyState from "@/components/EmptyState";
import { AnimeService } from "@/lib/api/anime.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог аниме",
  description: "Смотрите аниме онлайн бесплатно. Полный каталог релизов AniLiberty — онгоинги, новинки и классика."
};


export const revalidate = 300;

export default async function AnimeCatalogPage({
  searchParams
}: {
  searchParams: { page?: string; genre?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const genre = searchParams.genre ? Number(searchParams.genre) : undefined;

  const [{ items, pagination }, genres] = await Promise.all([
    AnimeService.getCatalog({ page, genres: genre ? [genre] : undefined }),
    AnimeService.getGenres()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-black text-paper">Каталог аниме</h1>
      <p className="mt-2 text-sm text-mist">Все релизы AniLiberty — свежее, онгоинги и завершённые тайтлы.</p>

      {genres.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/anime"
            className={`rounded-full px-3 py-1.5 text-sm ${
              !genre ? "bg-violet text-white" : "border border-line text-mist"
            }`}
          >
            Все жанры
          </Link>
          {genres.slice(0, 16).map((g) => (
            <Link
              key={g.id}
              href={`/anime?genre=${g.id}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                genre === g.id ? "bg-violet text-white" : "border border-line text-mist"
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          hint="AniLiberty не вернул результатов для этого фильтра. Попробуйте другой жанр."
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((r) => (
            <PosterCard
              key={r.id}
              href={`/anime/${r.alias}`}
              title={AnimeService.displayName(r)}
              subtitle={r.year ? String(r.year) : undefined}
              imageSrc={AnimeService.posterUrl(r.poster?.src)}
              badge={r.is_ongoing ? "Онлайн" : undefined}
            />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: pagination.pages }).slice(0, 10).map((_, i) => (
            <Link
              key={i}
              href={`/anime?page=${i + 1}${genre ? `&genre=${genre}` : ""}`}
              className={`h-9 w-9 rounded-full text-center text-sm leading-9 ${
                page === i + 1 ? "bg-violet text-white" : "border border-line text-mist"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

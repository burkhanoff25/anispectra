import PosterCard from "@/components/PosterCard";
import EmptyState from "@/components/EmptyState";
import { SearchService } from "@/lib/api/search.service";
import { AnimeService } from "@/lib/api/anime.service";
import { MangaService } from "@/lib/api/manga.service";

export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() ?? "";

  if (!q) {
    return (
      <EmptyState title="Введите запрос для поиска" hint="Ищите по названию аниме или манги." />
    );
  }

  const { anime, manga } = await SearchService.searchAll(q);

  const nothingFound = anime.length === 0 && manga.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-paper">
        Результаты по запросу «{q}»
      </h1>

      {nothingFound && (
        <EmptyState title="Ничего не найдено" hint="Проверьте написание или попробуйте другое слово." />
      )}

      {anime.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-display text-lg font-bold text-paper">Аниме</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {anime.map((r) => (
              <PosterCard
                key={r.id}
                href={`/anime/${r.alias}`}
                title={AnimeService.displayName(r)}
                subtitle={r.year ? String(r.year) : undefined}
                imageSrc={AnimeService.posterUrl(r.poster?.src)}
              />
            ))}
          </div>
        </section>
      )}

      {manga.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-lg font-bold text-paper">Манга</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {manga.map((m) => (
              <PosterCard
                key={m.id}
                href={`/manga/${m.id}`}
                title={MangaService.mangaTitle(m)}
                imageSrc={MangaService.coverUrl(m)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

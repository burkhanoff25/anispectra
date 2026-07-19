import Hero from "@/components/Hero";
import ShelfRow from "@/components/ShelfRow";
import PosterCard from "@/components/PosterCard";
import FilmDivider from "@/components/FilmDivider";
import EmptyState from "@/components/EmptyState";
import { AnimeService } from "@/lib/api/anime.service";
import { MangaService } from "@/lib/api/manga.service";

export const revalidate = 300;

export default async function HomePage() {
  const [releases, manga] = await Promise.all([
    AnimeService.getLatestReleases(20),
    MangaService.getPopularManga(16).catch(() => [])
  ]);

  const heroRelease = releases[0];

  return (
    <div>
      {heroRelease ? (
        <Hero release={heroRelease} />
      ) : (
        <EmptyState
          title="Не удалось загрузить свежие релизы"
          hint="AniLiberty временно недоступен. Загляните чуть позже."
        />
      )}

      <FilmDivider />

      {releases.length > 0 && (
        <ShelfRow title="Новые релизы" seeAllHref="/anime">
          {releases.map((r) => (
            <PosterCard
              key={r.id}
              href={`/anime/${r.alias}`}
              title={AnimeService.displayName(r)}
              subtitle={r.year ? String(r.year) : undefined}
              imageSrc={AnimeService.posterUrl(r.poster?.src)}
              badge={r.is_ongoing ? "Онлайн" : undefined}
            />
          ))}
        </ShelfRow>
      )}

      <FilmDivider />

      {manga.length > 0 && (
        <ShelfRow title="Популярная манга" seeAllHref="/manga">
          {manga.map((m) => (
            <PosterCard
              key={m.id}
              href={`/manga/${m.id}`}
              title={MangaService.mangaTitle(m)}
              imageSrc={MangaService.coverUrl(m)}
            />
          ))}
        </ShelfRow>
      )}
    </div>
  );
}

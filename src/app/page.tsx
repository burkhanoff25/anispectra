import ShelfRow from "@/components/ShelfRow";
import PosterCard from "@/components/PosterCard";
import FilmDivider from "@/components/FilmDivider";
import HeroShorts from "@/components/HeroShorts";
import SupportProject from "@/components/SupportProject";
import AdBanner from "@/components/AdBanner";
import YoutubeBanner from "@/components/YoutubeBanner";
import BannerSlider from "@/components/BannerSlider";
import AnimeHeroSlide from "@/components/AnimeHeroSlide";
import UzAnimeHeroSlide from "@/components/UzAnimeHeroSlide";

import { AnimeService } from "@/lib/api/anime.service";
import { MangaService } from "@/lib/api/manga.service";
import { getYoutubeShorts } from "@/lib/youtube";
import { prisma } from "@/server/db/client";

export const revalidate = 60;

export default async function HomePage() {
  const [releases, manga, shorts, uzAnimes] = await Promise.all([
    AnimeService.getLatestReleases(20),
    MangaService.getPopularManga(16).catch(() => []),
    getYoutubeShorts().catch(() => []),
    prisma.anime.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        episodes: {
          select: { id: true },
        }
      }
    }).catch(() => [])
  ]);

  const featuredAnimes = releases.slice(0, 5);

  // O'zbek animalarni hero slide uchun tayyorlaymiz
  const uzSlides = uzAnimes.map((a: any) => ({
    id: a.id,
    title: a.title,
    poster: a.poster,
    description: a.description,
    release_year: a.release_year,
    genres: a.genres,
    episodeCount: a.episodes.length,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://anispectra.uz/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://anispectra.uz/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="pt-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">Anispectra — смотреть аниме и читать мангу онлайн бесплатно</h1>

      {/* Combined Featured Animes, Uz Animes and Banners Slider */}
      <BannerSlider className="h-[400px] md:h-[450px]">

        {/* O'zbek anime sliderlari — birinchi ko'rinadi */}
        {uzSlides.map((anime: any) => (
          <UzAnimeHeroSlide key={`uz-${anime.id}`} anime={anime} />
        ))}

        {featuredAnimes.map(anime => (
          <AnimeHeroSlide key={anime.id} anime={anime} />
        ))}
        <AdBanner />
        <YoutubeBanner />
        <SupportProject />
      </BannerSlider>

      {shorts && shorts.length > 0 && <HeroShorts shorts={shorts} />}

      <FilmDivider />

      {/* O'zbekcha anime shelf */}
      {uzAnimes.length > 0 && (
        <ShelfRow title="O'zbekcha anime" seeAllHref="/uz-anime" seeAllLabel="Barchasini ko'rish →">
          {uzAnimes.map((a: any) => {
            const posterSrc = a.poster
              ? `/api/proxy/image?url=${encodeURIComponent(a.poster)}`
              : null;
            return (
              <PosterCard
                key={a.id}
                href={`/uz-anime/${a.id}`}
                title={a.title}
                subtitle={`${a.release_year ? a.release_year + ' • ' : ''}${a.episodes.length} qism`}
                imageSrc={posterSrc}
                badge={a.episodes.length > 0 ? `${a.episodes.length} qism` : undefined}
              />
            );
          })}
        </ShelfRow>
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

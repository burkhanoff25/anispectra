import ShelfRow from "@/components/ShelfRow";
import PosterCard from "@/components/PosterCard";
import FilmDivider from "@/components/FilmDivider";
import HeroShorts from "@/components/HeroShorts";
import SupportProject from "@/components/SupportProject";
import AdBanner from "@/components/AdBanner";
import YoutubeBanner from "@/components/YoutubeBanner";
import BannerSlider from "@/components/BannerSlider";
import AnimeHeroSlide from "@/components/AnimeHeroSlide";
import { AnimeService } from "@/lib/api/anime.service";
import { MangaService } from "@/lib/api/manga.service";
import { getYoutubeShorts } from "@/lib/youtube";

export const revalidate = 60;

export default async function HomePage() {
  const [releases, manga, shorts] = await Promise.all([
    AnimeService.getLatestReleases(20),
    MangaService.getPopularManga(16).catch(() => []),
    getYoutubeShorts().catch(() => [])
  ]);

  const featuredAnimes = releases.slice(0, 5);

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

      {/* Combined Featured Animes and Ad Banners Slider */}
      <BannerSlider className="h-[400px] md:h-[450px]">
        {featuredAnimes.map(anime => (
          <AnimeHeroSlide key={anime.id} anime={anime} />
        ))}
        <AdBanner />
        <YoutubeBanner />
        <SupportProject />
      </BannerSlider>

      {shorts && shorts.length > 0 && <HeroShorts shorts={shorts} />}

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

import { MetadataRoute } from "next";
import { AnimeService } from "@/lib/api/anime.service";
import { MangaService } from "@/lib/api/manga.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://anispectra-sigma.vercel.app";

  // Static pages
  const routes = [
    "",
    "/anime",
    "/manga",
    "/schedule",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic Anime pages
  let animeUrls: any[] = [];
  try {
    const releases = await AnimeService.getLatestReleases(100);
    animeUrls = releases.map((r) => ({
      url: `${baseUrl}/anime/${r.alias}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap generation error for anime releases:", e);
  }

  // Dynamic Manga pages
  let mangaUrls: any[] = [];
  try {
    const manga = await MangaService.getPopularManga(100).catch(() => []);
    mangaUrls = manga.map((m) => ({
      url: `${baseUrl}/manga/${m.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap generation error for manga:", e);
  }

  return [...routes, ...animeUrls, ...mangaUrls];
}

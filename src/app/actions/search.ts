"use server";

import { AnimeService } from "@/lib/api/anime.service";
import type { AniLibertyRelease } from "@/lib/types";

export async function searchAnilibria(query: string): Promise<AniLibertyRelease[]> {
  try {
    return await AnimeService.searchReleases(query);
  } catch (error) {
    console.error("Failed to search anilibria:", error);
    return [];
  }
}

export async function getAnimeByAlias(alias: string): Promise<AniLibertyRelease | null> {
  try {
    return await AnimeService.getReleaseByAlias(alias);
  } catch (error) {
    console.error("Failed to get anime by alias:", error);
    return null;
  }
}

export async function getPopularAnime(): Promise<AniLibertyRelease[]> {
  try {
    const data = await AnimeService.getCatalog({ sort: "rating", perPage: 10 });
    return data.items;
  } catch (error) {
    console.error("Failed to get popular anime:", error);
    return [];
  }
}

import { MangaService } from "@/lib/api/manga.service";
import type { MangaDexManga } from "@/lib/types";

export async function searchMangaAction(query: string): Promise<MangaDexManga[]> {
  try {
    return await MangaService.searchManga(query);
  } catch (error) {
    console.error("Failed to search manga:", error);
    return [];
  }
}

export async function getPopularMangaAction(): Promise<MangaDexManga[]> {
  try {
    return await MangaService.getPopularManga(10);
  } catch (error) {
    console.error("Failed to get popular manga:", error);
    return [];
  }
}

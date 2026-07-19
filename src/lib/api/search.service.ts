import type { AniLibertyRelease, MangaDexManga } from "../types";
import { AnimeService } from "./anime.service";
import { MangaService } from "./manga.service";

export interface GlobalSearchResult {
  anime: AniLibertyRelease[];
  manga: MangaDexManga[];
}

export class SearchService {
  static async searchAll(query: string): Promise<GlobalSearchResult> {
    if (!query.trim()) {
      return { anime: [], manga: [] };
    }

    const [animeRes, mangaRes] = await Promise.allSettled([
      AnimeService.searchReleases(query),
      MangaService.searchManga(query)
    ]);

    return {
      anime: animeRes.status === "fulfilled" ? animeRes.value : [],
      manga: mangaRes.status === "fulfilled" ? mangaRes.value : []
    };
  }
}

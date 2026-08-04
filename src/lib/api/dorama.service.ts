import type { DoramaItem, DoramaCatalogResponse, DoramaGenre } from "../types";
import { HttpClient } from "./core/HttpClient";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";

// Koreya, Yaponiya, Xitoy dramalari (animesiz)
const DORAMA_COUNTRIES = "KR|JP|CN|TW";
const DORAMA_LANGUAGES = "ko|ja|zh";
// TMDB genre id=16 = Animation (anime) — buni exclude qilamiz
const EXCLUDE_GENRES = "16";

export class DoramaService {
  private static get HEADERS(): Record<string, string> {
    const token = process.env.TMDB_READ_TOKEN;
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  }

  static posterUrl(path: string | null | undefined, size: "w300" | "w500" | "w780" | "original" = "w500"): string | null {
    if (!path) return null;
    return `${TMDB_IMG}/${size}${path}`;
  }

  static backdropUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    return `${TMDB_IMG}/w1280${path}`;
  }

  static async getPopular(page = 1): Promise<DoramaCatalogResponse> {
    const params = new URLSearchParams({
      language: "ru-RU",
      sort_by: "popularity.desc",
      page: String(page),
      with_origin_country: DORAMA_COUNTRIES,
      with_original_language: DORAMA_LANGUAGES,
      without_genres: EXCLUDE_GENRES,
      "vote_count.gte": "50",
    });

    const data = await HttpClient.fetch<DoramaCatalogResponse>(
      `${TMDB_BASE}/discover/tv?${params}`,
      { headers: this.HEADERS, next: { revalidate: 300 } }
    );
    return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  static async getTopRated(page = 1): Promise<DoramaCatalogResponse> {
    const params = new URLSearchParams({
      language: "ru-RU",
      sort_by: "vote_average.desc",
      page: String(page),
      with_origin_country: DORAMA_COUNTRIES,
      with_original_language: DORAMA_LANGUAGES,
      without_genres: EXCLUDE_GENRES,
      "vote_count.gte": "200",
    });

    const data = await HttpClient.fetch<DoramaCatalogResponse>(
      `${TMDB_BASE}/discover/tv?${params}`,
      { headers: this.HEADERS, next: { revalidate: 300 } }
    );
    return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  static async getNew(page = 1): Promise<DoramaCatalogResponse> {
    const params = new URLSearchParams({
      language: "ru-RU",
      sort_by: "first_air_date.desc",
      page: String(page),
      with_origin_country: DORAMA_COUNTRIES,
      with_original_language: DORAMA_LANGUAGES,
      without_genres: EXCLUDE_GENRES,
      "vote_count.gte": "10",
      "first_air_date.lte": new Date().toISOString().split("T")[0],
    });

    const data = await HttpClient.fetch<DoramaCatalogResponse>(
      `${TMDB_BASE}/discover/tv?${params}`,
      { headers: this.HEADERS, next: { revalidate: 300 } }
    );
    return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  static async search(query: string, page = 1): Promise<DoramaCatalogResponse> {
    if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    const params = new URLSearchParams({
      query,
      language: "ru-RU",
      page: String(page),
    });
    const data = await HttpClient.fetch<DoramaCatalogResponse>(
      `${TMDB_BASE}/search/tv?${params}`,
      { headers: this.HEADERS, next: { revalidate: 300 } }
    );
    // Filter to Asian dramas only (no anime — exclude Animation genre id=16)
    if (data?.results) {
      data.results = data.results.filter((item) =>
        item.origin_country?.some((c) => ["KR", "JP", "CN", "TW"].includes(c)) &&
        !item.genre_ids?.includes(16)
      );
    }
    return data ?? { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  static async getById(id: number): Promise<DoramaItem | null> {
    return HttpClient.fetch<DoramaItem>(
      `${TMDB_BASE}/tv/${id}?language=ru-RU`,
      { headers: this.HEADERS, next: { revalidate: 300 } }
    );
  }

  static async getGenres(): Promise<DoramaGenre[]> {
    const data = await HttpClient.fetch<{ genres: DoramaGenre[] }>(
      `${TMDB_BASE}/genre/tv/list?language=ru-RU`,
      { headers: this.HEADERS, next: { revalidate: 86400 } }
    );
    return data?.genres ?? [];
  }

  static countryFlag(countryCodes: string[]): string {
    const map: Record<string, string> = {
      KR: "🇰🇷",
      JP: "🇯🇵",
      CN: "🇨🇳",
      TW: "🇹🇼",
    };
    return countryCodes.map((c) => map[c] || "").filter(Boolean)[0] || "🌏";
  }

  static countryName(countryCodes: string[]): string {
    const map: Record<string, string> = {
      KR: "Корея",
      JP: "Япония",
      CN: "Китай",
      TW: "Тайвань",
    };
    return countryCodes.map((c) => map[c] || "").filter(Boolean)[0] || "Азия";
  }

  static displayName(item: DoramaItem): string {
    // Prefer Russian name, fallback to original
    return item.name || item.original_name || "Без названия";
  }
}

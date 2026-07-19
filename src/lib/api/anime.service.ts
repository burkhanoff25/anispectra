import type { AniLibertyRelease, AniLibertyGenre, AniLibertyCatalogResponse } from "../types";
import { HttpClient } from "./core/HttpClient";

export class AnimeService {
  private static get BASE() {
    return process.env.NEXT_PUBLIC_ANILIBERTY_BASE ?? "https://anilibria.top/api/v1";
  }

  static posterUrl(src: string | null | undefined): string | null {
    if (!src) return null;
    if (src.startsWith("http")) return src;
    return `https://anilibria.top${src.startsWith("/") ? "" : "/"}${src}`;
  }

  static displayName(release: Pick<AniLibertyRelease, "name">): string {
    return release.name?.main || release.name?.english || "Без названия";
  }

  static async getLatestReleases(limit = 20): Promise<AniLibertyRelease[]> {
    const data = await HttpClient.fetch<AniLibertyRelease[]>(`${this.BASE}/anime/releases/latest?limit=${limit}`, {
      next: { revalidate: 300 }
    });
    return data ?? [];
  }

  static async getRandomReleases(): Promise<AniLibertyRelease[]> {
    const items: AniLibertyRelease[] = [];
    const single = await HttpClient.fetch<AniLibertyRelease>(`${this.BASE}/anime/releases/random`, {
      next: { revalidate: 0 } // Random shouldn't be strongly cached
    });
    if (single) items.push(single);
    return items;
  }

  static async getCatalog(params: {
    page?: number;
    perPage?: number;
    genres?: number[];
    sort?: "fresh_at" | "rating" | "year";
    query?: string;
  }): Promise<{ items: AniLibertyRelease[]; pagination: AniLibertyCatalogResponse["meta"]["pagination"] | null }> {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("items_per_page", String(params.perPage ?? 24));
    if (params.genres?.length) search.set("f[genres]", params.genres.join(","));
    if (params.sort) search.set("f[sorting]", params.sort);
    if (params.query) search.set("f[search]", params.query);

    const data = await HttpClient.fetch<AniLibertyCatalogResponse>(`${this.BASE}/anime/catalog/releases?${search.toString()}`, {
      next: { revalidate: 300 }
    });
    if (!data) return { items: [], pagination: null };
    return { items: data.data ?? [], pagination: data.meta?.pagination ?? null };
  }

  static async searchReleases(query: string): Promise<AniLibertyRelease[]> {
    if (!query.trim()) return [];
    const data = await HttpClient.fetch<{ releases: AniLibertyRelease[] }>(
      `${this.BASE}/app/search/releases?query=${encodeURIComponent(query)}`,
      { next: { revalidate: 300 } }
    );
    if (Array.isArray(data)) return data as unknown as AniLibertyRelease[];
    return data?.releases ?? [];
  }

  static async getReleaseByAlias(alias: string): Promise<AniLibertyRelease | null> {
    return HttpClient.fetch<AniLibertyRelease>(`${this.BASE}/anime/releases/${alias}`, {
      next: { revalidate: 300 }
    });
  }

  static async getGenres(): Promise<AniLibertyGenre[]> {
    const data = await HttpClient.fetch<AniLibertyGenre[]>(`${this.BASE}/anime/genres`, {
      next: { revalidate: 3600 }
    });
    return data ?? [];
  }

  // Franchises
  static async getFranchises() {
    return HttpClient.fetch(`${this.BASE}/anime/franchises`);
  }

  static async getFranchiseById(id: string) {
    return HttpClient.fetch(`${this.BASE}/anime/franchises/${id}`);
  }

  // Schedule
  static async getScheduleNow() {
    return HttpClient.fetch(`${this.BASE}/anime/schedule/now`, { next: { revalidate: 300 } });
  }

  static async getScheduleWeek() {
    const rawData = await HttpClient.fetch<Array<{ release?: { publish_day?: { value: number } }, [key: string]: unknown }>>(`${this.BASE}/anime/schedule/week`, { next: { revalidate: 300 } });
    if (!Array.isArray(rawData)) return [];

    const grouped = new Map<number, AniLibertyRelease[]>();
    for (let i = 0; i < 7; i++) grouped.set(i, []);

    for (const item of rawData) {
      if (item.release && item.release.publish_day) {
        // publish_day.value is 1-7 (1 = Monday, 7 = Sunday)
        const dayIndex = item.release.publish_day.value - 1;
        if (dayIndex >= 0 && dayIndex < 7) {
          grouped.get(dayIndex)?.push(item.release as AniLibertyRelease);
        }
      }
    }

    return Array.from(grouped.entries())
      .map(([day, list]) => ({ day, list }))
      .sort((a, b) => a.day - b.day);
  }

  // Torrents
  static async getTorrents() {
    return HttpClient.fetch(`${this.BASE}/anime/torrents`);
  }

  static async getTorrentsByRelease(releaseId: string) {
    return HttpClient.fetch(`${this.BASE}/anime/torrents/release/${releaseId}`);
  }
}

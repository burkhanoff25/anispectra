import { HttpClient } from "./core/HttpClient";
import type { MangaDexManga, MangaDexChapter } from "../types";

export class MangaService {
  private static get BASE() {
    return "https://api.mangadex.org";
  }

  static coverFileName(m: MangaDexManga): string | null {
    const cover = m.relationships?.find((r) => r.type === "cover_art");
    return (cover?.attributes?.fileName as string) ?? null;
  }

  static coverUrl(m: MangaDexManga, size: 256 | 512 = 512): string | null {
    const file = this.coverFileName(m);
    if (!file) return null;
    return `https://uploads.mangadex.org/covers/${m.id}/${file}.${size}.jpg`;
  }

  static mangaTitle(m: MangaDexManga): string {
    return m.attributes.title.ru || m.attributes.title.en || m.attributes.title["ja-ro"] || "Манга без названия";
  }

  static async getPopularManga(limit = 12): Promise<MangaDexManga[]> {
    const search = new URLSearchParams();
    search.set("limit", limit.toString());
    search.set("includes[]", "cover_art");
    search.set("hasAvailableChapters", "true");
    search.set("availableTranslatedLanguage[]", "ru");
    search.set("order[rating]", "desc");

    const data = await HttpClient.fetch<{ data: MangaDexManga[] }>(`${this.BASE}/manga?${search.toString()}`, {
      next: { revalidate: 3600 }
    });

    return data?.data ?? [];
  }

  static async searchManga(query: string): Promise<MangaDexManga[]> {
    if (!query) return [];

    const search = new URLSearchParams();
    search.set("title", query);
    search.set("limit", "12");
    search.set("includes[]", "cover_art");
    search.set("hasAvailableChapters", "true");

    const data = await HttpClient.fetch<{ data: MangaDexManga[] }>(`${this.BASE}/manga?${search.toString()}`);

    return data?.data ?? [];
  }

  static async getMangaById(id: string): Promise<MangaDexManga | null> {
    const search = new URLSearchParams();
    search.set("includes[]", "cover_art");
    search.set("includes[]", "author");

    const data = await HttpClient.fetch<{ data: MangaDexManga }>(`${this.BASE}/manga/${id}?${search.toString()}`);
    return data?.data ?? null;
  }

  static async getMangaChapters(mangaId: string, limit = 50, offset = 0): Promise<MangaDexChapter[]> {
    const search = new URLSearchParams();
    search.set("limit", limit.toString());
    search.set("offset", offset.toString());
    search.set("translatedLanguage[]", "ru");
    search.set("order[chapter]", "asc");

    const data = await HttpClient.fetch<{ data: MangaDexChapter[] }>(`${this.BASE}/manga/${mangaId}/feed?${search.toString()}`);
    return data?.data ?? [];
  }

  static async getChapterPages(chapterId: string): Promise<string[]> {
    const data = await HttpClient.fetch<{ baseUrl: string; chapter: { hash: string; data: string[] } }>(
      `${this.BASE}/at-home/server/${chapterId}`
    );

    if (!data || !data.chapter) return [];

    return data.chapter.data.map((file) => `${data.baseUrl}/data/${data.chapter.hash}/${file}`);
  }
}

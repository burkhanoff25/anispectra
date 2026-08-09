import { HttpClient } from "./core/HttpClient";
import type { KodikResultItem } from "../types";

export class PlayerService {
  private static get BASE() {
    return "https://kodikapi.com";
  }

  private static get TOKEN() {
    return process.env.KODIK_API_TOKEN ?? process.env.KODIK_API_KEY ?? "";
  }

  // Anime uchun: title bo'yicha birinchi natija
  static async findVideo(title: string): Promise<KodikResultItem | null> {
    if (!this.TOKEN) return null;

    try {
      const search = new URLSearchParams();
      search.set("token", this.TOKEN);
      search.set("title", title);
      search.set("limit", "1");

      const data = await HttpClient.fetch<{ results: KodikResultItem[] }>(
        `${this.BASE}/search?${search.toString()}`
      );
      if (data && data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  // Dorama uchun: barcha natijalar (dublyaj tanlash imkoni)
  static async findDorama(
    title: string,
    originalTitle?: string
  ): Promise<KodikResultItem | null> {
    if (!this.TOKEN) return null;

    const trySearch = async (q: string): Promise<KodikResultItem[]> => {
      try {
        const search = new URLSearchParams();
        search.set("token", this.TOKEN);
        search.set("title", q);
        search.set("limit", "10");
        search.set("types", "foreign-serial,foreign-movie");
        search.set("with_material_data", "true");

        const data = await HttpClient.fetch<{ results: KodikResultItem[] }>(
          `${this.BASE}/search?${search.toString()}`
        );
        return data?.results ?? [];
      } catch {
        return [];
      }
    };

    // 1. Rus nomda qidirish
    let results = await trySearch(title);

    // 2. Agar topilmasa, original nomda qidirish
    if (results.length === 0 && originalTitle) {
      results = await trySearch(originalTitle);
    }

    if (results.length === 0) return null;

    // Ozvuchka prioriteti: rus dublyaj > subtitr > birinchi natija
    const withRusDub = results.find(
      (r) =>
        r.translation?.type === "voice" &&
        (r.translation?.title?.toLowerCase().includes("рус") ||
          r.translation?.title?.toLowerCase().includes("дублир"))
    );
    const withSubs = results.find(
      (r) =>
        r.translation?.type === "subtitles"
    );

    return withRusDub ?? withSubs ?? results[0];
  }
}

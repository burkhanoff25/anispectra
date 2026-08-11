import { HttpClient } from "./core/HttpClient";
import type { KodikResultItem } from "../types";

export type FindDoramaResult = {
  items: KodikResultItem[];
  error?: "no_token" | "auth_failed" | "not_found" | "network_error";
};

export class PlayerService {
  private static get BASE() {
    return "https://kodik-api.com";
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
    } catch (err) {
      console.error(`[Kodik API Error] Anime qidirishda xatolik (Title: "${title}"):`, err);
      return null;
    }
  }

  // Dorama uchun: barcha natijalar
  static async findDorama(
    title: string,
    originalTitle?: string
  ): Promise<FindDoramaResult> {
    if (!this.TOKEN) {
      return { items: [], error: "no_token" };
    }

    const trySearch = async (q: string): Promise<FindDoramaResult> => {
      try {
        const search = new URLSearchParams();
        search.set("token", this.TOKEN);
        search.set("title", q);
        search.set("limit", "20");
        search.set(
          "types",
          "anime,anime-serial,foreign-serial,foreign-movie,cartoon-serial,cartoon-movie"
        );
        search.set("with_material_data", "true");

        const data = await HttpClient.fetch<{ results: KodikResultItem[] }>(
          `${this.BASE}/search?${search.toString()}`
        );
        if (data === null) {
          // 401/403 yoki JSON parse hatosi
          return { items: [], error: "auth_failed" };
        }
        const results = data.results ?? [];
        return { items: results };
      } catch (err) {
        console.error(`[Kodik API Error] Dorama qidirishda xatolik (Query: "${q}"):`, err);
        return { items: [], error: "network_error" };
      }
    };

    // birinchi qidiruv
    let result = await trySearch(title);

    // ikkinchi urinish agar bo‘sh va originalTitle berilgan
    if (result.items.length === 0 && originalTitle) {
      result = await trySearch(originalTitle);
    }

    // bo‘sh natija → not_found (agar avval error bo'lmasa)
    if (result.items.length === 0 && !result.error) {
      result.error = "not_found";
    }

    // noyob tarjimalar
    const unique: KodikResultItem[] = [];
    const seen = new Set<string>();
    for (const item of result.items) {
      const transId = item.translation?.id ? String(item.translation.id) : "original";
      if (!seen.has(transId)) {
        seen.add(transId);
        unique.push(item);
      }
    }

    // sort softbox, rus
    unique.sort((a, b) => {
      const aTitle = a.translation?.title?.toLowerCase() ?? "";
      const bTitle = b.translation?.title?.toLowerCase() ?? "";
      if (aTitle.includes("softbox")) return -1;
      if (bTitle.includes("softbox")) return 1;
      if (aTitle.includes("рус") && !bTitle.includes("рус")) return -1;
      if (!aTitle.includes("рус") && bTitle.includes("рус")) return 1;
      return 0;
    });

    return { items: unique, error: result.error };
  }
}

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

  // Dorama uchun: barcha natijalar
  static async findDorama(
    title: string,
    originalTitle?: string
  ): Promise<KodikResultItem[]> {
    if (!this.TOKEN) return [];

    const trySearch = async (q: string): Promise<KodikResultItem[]> => {
      try {
        const search = new URLSearchParams();
        search.set("token", this.TOKEN);
        search.set("title", q);
        search.set("limit", "20"); // Ko'proq natija olaylik
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

    let results = await trySearch(title);

    if (results.length === 0 && originalTitle) {
      results = await trySearch(originalTitle);
    }

    // Noyob tarjimalarni ajratib olish (ba'zida kodik bir xil tarjimani turli sifatlarda ikki marta beradi)
    const uniqueResults = [];
    const seenTranslations = new Set<string>();

    for (const item of results) {
      const transId = item.translation?.id ? String(item.translation.id) : "original";
      if (!seenTranslations.has(transId)) {
        seenTranslations.add(transId);
        uniqueResults.push(item);
      }
    }

    // Softbox ni birinchi o'ringa, keyin boshqa rus dublyajlarini qo'yish
    uniqueResults.sort((a, b) => {
      const aTitle = a.translation?.title?.toLowerCase() || "";
      const bTitle = b.translation?.title?.toLowerCase() || "";
      
      if (aTitle.includes("softbox")) return -1;
      if (bTitle.includes("softbox")) return 1;
      
      if (aTitle.includes("рус") && !bTitle.includes("рус")) return -1;
      if (!aTitle.includes("рус") && bTitle.includes("рус")) return 1;

      return 0;
    });

    return uniqueResults;
  }
}

import { HttpClient } from "./core/HttpClient";
import type { KodikResultItem } from "../types";

export class PlayerService {
  private static get BASE() {
    return "https://kodikapi.com";
  }

  private static get TOKEN() {
    return process.env.KODIK_API_TOKEN ?? "";
  }

  static async findVideo(title: string): Promise<KodikResultItem | null> {
    if (!this.TOKEN) return null;

    try {
      const search = new URLSearchParams();
      search.set("token", this.TOKEN);
      search.set("title", title);
      search.set("limit", "1");

      const data = await HttpClient.fetch<{ results: KodikResultItem[] }>(`${this.BASE}/search?${search.toString()}`);
      if (data && data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch {
      return null;
    }
  }
}

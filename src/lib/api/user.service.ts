import { HttpClient } from "./core/HttpClient";
import type { AniLibertyRelease } from "../types";

export interface AniLibertyProfile {
  id: number;
  login: string;
  nickname: string;
  email: string;
  avatar_original: string;
  avatar_thumbnail: string;
}

export class UserService {
  private static get BASE() {
    return process.env.NEXT_PUBLIC_ANILIBERTY_BASE ?? "https://anilibria.top/api/v1";
  }

  // Profile
  static async getProfile(cookieStr?: string): Promise<AniLibertyProfile | null> {
    return HttpClient.fetch<AniLibertyProfile>(`${this.BASE}/accounts/users/me/profile`, {
      headers: cookieStr ? { Cookie: cookieStr } : undefined,
    });
  }

  // Collections (Favorites)
  static async getFavoritesIds() {
    return HttpClient.fetch<{ id: number; type: string }[]>(`${this.BASE}/accounts/users/me/favorites/ids`);
  }

  static async getFavoritesReleases() {
    return HttpClient.fetch<{ data: AniLibertyRelease[] }>(`${this.BASE}/accounts/users/me/favorites/releases`);
  }

  // History (AniLiberty's built-in history, but we also use our own)
  static async getHistory() {
    return HttpClient.fetch(`${this.BASE}/accounts/users/me/views/history`);
  }

  static async getTimecodes() {
    return HttpClient.fetch(`${this.BASE}/accounts/users/me/views/timecodes`);
  }
}

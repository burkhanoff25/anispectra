import { prisma } from "@/server/db/client";

export class HistoryService {
  /**
   * Anime History
   */
  static async upsertAnimeHistory(data: {
    userId?: string;
    aniLibertyId?: string;
    titleId: string;
    episode: number;
    season: number;
    progressSeconds: number;
  }) {
    if (!data.userId && !data.aniLibertyId) {
      throw new Error("Must provide either userId or aniLibertyId");
    }

    // Try to find existing record
    const existing = await prisma.animeHistory.findFirst({
      where: {
        userId: data.userId || null,
        aniLibertyId: data.aniLibertyId || null,
        titleId: data.titleId,
        episode: data.episode,
        season: data.season,
      },
    });

    if (existing) {
      return prisma.animeHistory.update({
        where: { id: existing.id },
        data: {
          progressSeconds: data.progressSeconds,
          timestamp: new Date(),
        },
      });
    }

    return prisma.animeHistory.create({
      data: {
        userId: data.userId || null,
        aniLibertyId: data.aniLibertyId || null,
        titleId: data.titleId,
        episode: data.episode,
        season: data.season,
        progressSeconds: data.progressSeconds,
      },
    });
  }

  static async getAnimeHistory(params: { userId?: string; aniLibertyId?: string }, limit = 10) {
    if (!params.userId && !params.aniLibertyId) return [];

    return prisma.animeHistory.findMany({
      where: {
        OR: [
          params.userId ? { userId: params.userId } : {},
          params.aniLibertyId ? { aniLibertyId: params.aniLibertyId } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  /**
   * Manga History
   */
  static async upsertMangaHistory(data: {
    userId?: string;
    aniLibertyId?: string;
    mangaId: string;
    chapter: string;
    page: number;
  }) {
    if (!data.userId && !data.aniLibertyId) {
      throw new Error("Must provide either userId or aniLibertyId");
    }

    const existing = await prisma.mangaHistory.findFirst({
      where: {
        userId: data.userId || null,
        aniLibertyId: data.aniLibertyId || null,
        mangaId: data.mangaId,
        chapter: data.chapter,
      },
    });

    if (existing) {
      return prisma.mangaHistory.update({
        where: { id: existing.id },
        data: {
          page: data.page,
          timestamp: new Date(),
        },
      });
    }

    return prisma.mangaHistory.create({
      data: {
        userId: data.userId || null,
        aniLibertyId: data.aniLibertyId || null,
        mangaId: data.mangaId,
        chapter: data.chapter,
        page: data.page,
      },
    });
  }

  static async getMangaHistory(params: { userId?: string; aniLibertyId?: string }, limit = 10) {
    if (!params.userId && !params.aniLibertyId) return [];

    return prisma.mangaHistory.findMany({
      where: {
        OR: [
          params.userId ? { userId: params.userId } : {},
          params.aniLibertyId ? { aniLibertyId: params.aniLibertyId } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }
}

import { UserService } from "@/lib/api/user.service";
import ProfileClient from "./ProfileClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HistoryService } from "@/server/history/HistoryService";
import { AnimeService } from "@/lib/api/anime.service";
import type { Metadata } from "next";
import { prisma } from "@/server/db/client";

import { AnimeHistory, MangaHistory } from "@prisma/client";

export const metadata: Metadata = {
  title: "Профиль",
  description: "Войдите в личный кабинет Anispectra, чтобы отслеживать историю просмотров аниме и чтения манги."
};

export const revalidate = 0;

export default async function ProfilePage() {
  const [aniProfileRes, aniFavoritesRes, googleSession, popularRes] = await Promise.allSettled([
    UserService.getProfile(),
    UserService.getFavoritesReleases(),
    getServerSession(authOptions),
    AnimeService.getLatestReleases(5),
  ]);

  const aniProfile = aniProfileRes.status === "fulfilled" ? aniProfileRes.value : null;
  const aniFavorites = aniFavoritesRes.status === "fulfilled" ? aniFavoritesRes.value?.data || [] : [];
  const session = googleSession.status === "fulfilled" ? googleSession.value : null;
  const popularReleases = popularRes.status === "fulfilled" ? popularRes.value : [];

  // Gather history based on whichever auth they have
  const userId = session?.user?.id;
  const aniLibertyId = aniProfile?.id ? String(aniProfile.id) : undefined;

  let animeHistory: AnimeHistory[] = [];
  let mangaHistory: MangaHistory[] = [];
  let dbAnimeFavorites: any[] = [];
  let dbMangaFavorites: any[] = [];

  if (userId || aniLibertyId) {
    const [aHist, mHist, aFavs, mFavs] = await Promise.all([
      HistoryService.getAnimeHistory({ userId, aniLibertyId }),
      HistoryService.getMangaHistory({ userId, aniLibertyId }),
      prisma.animeFavorite.findMany({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(aniLibertyId ? [{ aniLibertyId }] : []),
          ],
        },
        orderBy: { timestamp: "desc" },
      }),
      prisma.mangaFavorite.findMany({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(aniLibertyId ? [{ aniLibertyId }] : []),
          ],
        },
        orderBy: { timestamp: "desc" },
      }),
    ]);
    animeHistory = aHist;
    mangaHistory = mHist;
    dbAnimeFavorites = aFavs;
    dbMangaFavorites = mFavs;
  }

  return (
    <ProfileClient
      aniProfile={aniProfile}
      aniFavorites={aniFavorites}
      googleSession={session}
      animeHistory={animeHistory}
      mangaHistory={mangaHistory}
      popularReleases={popularReleases}
      dbAnimeFavorites={dbAnimeFavorites}
      dbMangaFavorites={dbMangaFavorites}
    />
  );
}

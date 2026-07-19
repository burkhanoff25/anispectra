import { UserService } from "@/lib/api/user.service";
import ProfileClient from "./ProfileClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HistoryService } from "@/server/history/HistoryService";

import { AnimeHistory, MangaHistory } from "@prisma/client";

export const revalidate = 0;

export default async function ProfilePage() {
  const [aniProfileRes, aniFavoritesRes, googleSession] = await Promise.allSettled([
    UserService.getProfile(),
    UserService.getFavoritesReleases(),
    getServerSession(authOptions),
  ]);

  const aniProfile = aniProfileRes.status === "fulfilled" ? aniProfileRes.value : null;
  const aniFavorites = aniFavoritesRes.status === "fulfilled" ? aniFavoritesRes.value?.data || [] : [];
  const session = googleSession.status === "fulfilled" ? googleSession.value : null;

  // Gather history based on whichever auth they have
  const userId = session?.user?.id;
  const aniLibertyId = aniProfile?.id ? String(aniProfile.id) : undefined;

  let animeHistory: AnimeHistory[] = [];
  let mangaHistory: MangaHistory[] = [];

  if (userId || aniLibertyId) {
    const [aHist, mHist] = await Promise.all([
      HistoryService.getAnimeHistory({ userId, aniLibertyId }),
      HistoryService.getMangaHistory({ userId, aniLibertyId }),
    ]);
    animeHistory = aHist;
    mangaHistory = mHist;
  }

  return (
    <ProfileClient
      aniProfile={aniProfile}
      aniFavorites={aniFavorites}
      googleSession={session}
      animeHistory={animeHistory}
      mangaHistory={mangaHistory}
    />
  );
}

"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import type { AniLibertyProfile } from "@/lib/api/user.service";
import type { AniLibertyRelease } from "@/lib/types";
import { Session } from "next-auth";
import { AnimeHistory, MangaHistory } from "@prisma/client";
import PosterCard from "@/components/PosterCard";
import { AnimeService } from "@/lib/api/anime.service";
import EmptyState from "@/components/EmptyState";
import { LogOut, Settings, PlayCircle, BookOpen } from "lucide-react";
import Link from "next/link";

interface ProfileClientProps {
  aniProfile: AniLibertyProfile | null;
  aniFavorites: AniLibertyRelease[];
  googleSession: Session | null;
  animeHistory: AnimeHistory[];
  mangaHistory: MangaHistory[];
  popularReleases?: AniLibertyRelease[];
  dbAnimeFavorites?: any[];
  dbMangaFavorites?: any[];
}

export default function ProfileClient({
  aniProfile,
  aniFavorites,
  googleSession,
  animeHistory,
  mangaHistory,
  popularReleases = [],
  dbAnimeFavorites = [],
  dbMangaFavorites = [],
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"anime" | "manga">("anime");

  const handleLogout = () => {
    if (googleSession) {
      signOut();
    }
  };

  const hasAnyAuth = !!aniProfile || !!googleSession;

  if (!hasAnyAuth) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-display text-3xl font-black text-paper">Профиль</h1>
        
        <div className="rounded-3xl border border-line bg-panel p-8 text-center shadow-glow">
          <EmptyState
            title="Вы не авторизованы"
            hint="Войдите в свой аккаунт с помощью Google, чтобы сохранять историю просмотров аниме и чтения манги."
          />
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => signIn("google")}
              className="w-full sm:w-auto rounded-xl bg-accent px-8 py-3.5 font-bold text-white transition hover:bg-accent/90 shadow-glow"
            >
              Войти через Google
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto rounded-xl border border-line bg-surface px-8 py-3.5 font-bold text-paper transition hover:border-accent hover:text-accent text-center"
            >
              На главную
            </Link>
          </div>
        </div>

        {popularReleases.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-xl font-bold text-paper">Популярно сейчас</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {popularReleases.map((fav) => (
                <PosterCard
                  key={fav.id}
                  href={`/anime/${fav.alias}`}
                  title={AnimeService.displayName(fav)}
                  imageSrc={AnimeService.posterUrl(fav.poster?.src)}
                  badge="Популярно"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Determine primary display info
  const displayName = googleSession?.user?.name || aniProfile?.nickname || aniProfile?.login || "User";
  let avatarUrl = googleSession?.user?.image || aniProfile?.avatar_thumbnail || aniProfile?.avatar_original;
  if (avatarUrl === "/" || !avatarUrl) {
    avatarUrl = ""; // Fallback will trigger
  }

  const mergedAnimeFavorites = [
    ...dbAnimeFavorites.map(fav => ({
      id: fav.id,
      alias: fav.titleId,
      title: fav.titleName,
      imageSrc: fav.imageSrc
    })),
    ...aniFavorites.map(fav => ({
      id: String(fav.id),
      alias: fav.alias,
      title: AnimeService.displayName(fav),
      imageSrc: AnimeService.posterUrl(fav.poster?.src)
    }))
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header Profile Section */}
      <div className="mb-10 flex flex-col items-center gap-6 rounded-3xl border border-line bg-panel p-8 sm:flex-row sm:items-start shadow-glow">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-line bg-surface">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={avatarUrl.startsWith('http') ? avatarUrl : `https://anilibria.top${avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/20 text-2xl font-bold text-accent">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-black text-paper">{displayName}</h1>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {aniProfile && (
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                AniLiberty
              </span>
            )}
            {googleSession && (
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
                Google
              </span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-bold text-mist transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
            <button
              disabled
              title="Редактирование профиля пока недоступно"
              className="flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-sm font-bold text-mist opacity-50 cursor-not-allowed transition"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </button>
            {!googleSession && (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
              >
                Continue with Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-line pb-4">
        <button
          onClick={() => setActiveTab("anime")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold transition ${
            activeTab === "anime"
              ? "bg-accent/10 text-accent"
              : "text-mist hover:bg-panel hover:text-paper"
          }`}
        >
          <PlayCircle className="h-5 w-5" />
          Аниме
        </button>
        <button
          onClick={() => setActiveTab("manga")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold transition ${
            activeTab === "manga"
              ? "bg-accent/10 text-accent"
              : "text-mist hover:bg-panel hover:text-paper"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          Манга
        </button>
      </div>

      {/* Anime Tab Content */}
      {activeTab === "anime" && (
        <div className="space-y-12">
          <section>
            <h2 className="mb-6 font-display text-2xl font-bold text-paper">Избранное Аниме</h2>
            {mergedAnimeFavorites.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {mergedAnimeFavorites.map((fav) => (
                  <div key={fav.id} className="w-40 shrink-0 snap-start sm:w-48">
                    <PosterCard
                      href={`/anime/${fav.alias}`}
                      title={fav.title}
                      imageSrc={fav.imageSrc}
                      badge="Избранное"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="У вас пока нет избранного аниме"
                hint="Добавляйте тайтлы в избранное, чтобы они появились здесь."
              />
            )}
          </section>

          <section>
            <h2 className="mb-6 font-display text-2xl font-bold text-paper">История просмотра</h2>
            {animeHistory.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {animeHistory.map((hist) => (
                  <a
                    key={hist.id}
                    href={`/anime/${hist.titleId}?season=${hist.season}&episode=${hist.episode}&resume=${hist.progressSeconds}`}
                    className="w-40 shrink-0 snap-start sm:w-48 group"
                  >
                    <div className="aspect-[2/3] rounded-xl border border-line bg-panel2 flex flex-col items-center justify-center gap-2 transition group-hover:border-accent group-hover:shadow-glow overflow-hidden relative">
                      <PlayCircle className="h-10 w-10 text-accent/50 group-hover:text-accent transition" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-2">
                        <p className="text-xs font-bold text-paper text-center">Сезон {hist.season}, Эп. {hist.episode}</p>
                        <p className="text-[10px] text-mist text-center mt-0.5">
                          {Math.floor(hist.progressSeconds / 60)}:{String(hist.progressSeconds % 60).padStart(2, "0")} мин
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-mist text-center truncate">Продолжить просмотр</p>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Вы ещё ничего не смотрели"
                hint="История просмотра появится после просмотра первой серии."
              />
            )}
          </section>
        </div>
      )}

      {/* Manga Tab Content */}
      {activeTab === "manga" && (
        <div className="space-y-12">
          <section>
            <h2 className="mb-6 font-display text-2xl font-bold text-paper">Закладки Манги</h2>
            {dbMangaFavorites.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {dbMangaFavorites.map((fav) => (
                  <div key={fav.id} className="w-40 shrink-0 snap-start sm:w-48">
                    <PosterCard
                      href={`/manga/${fav.mangaId}`}
                      title={fav.titleName}
                      imageSrc={fav.imageSrc}
                      badge="Закладка"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="У вас пока нет сохранённой манги"
                hint="Добавляйте мангу в закладки, чтобы она появилась здесь."
              />
            )}
          </section>

          <section>
            <h2 className="mb-6 font-display text-2xl font-bold text-paper">История чтения</h2>
            {mangaHistory.length > 0 ? (
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                {mangaHistory.map((hist) => (
                  <a
                    key={hist.id}
                    href={`/manga/${hist.mangaId}?chapter=${hist.chapter}&page=${hist.page}`}
                    className="w-40 shrink-0 snap-start sm:w-48 group"
                  >
                    <div className="aspect-[2/3] rounded-xl border border-line bg-panel2 flex flex-col items-center justify-center gap-2 transition group-hover:border-accent group-hover:shadow-glow overflow-hidden relative">
                      <BookOpen className="h-10 w-10 text-accent/50 group-hover:text-accent transition" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-2">
                        <p className="text-xs font-bold text-paper text-center">Глава {hist.chapter}</p>
                        <p className="text-[10px] text-mist text-center mt-0.5">Стр. {hist.page}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-mist text-center truncate">Продолжить чтение</p>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Вы ещё ничего не читали"
                hint="История чтения появится после открытия первой главы."
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

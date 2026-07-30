import Image from "next/image";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import DisqusComments from "@/components/DisqusComments";
import FilmDivider from "@/components/FilmDivider";
import { AnimeService } from "@/lib/api/anime.service";
import type { Metadata } from "next";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HistoryService } from "@/server/history/HistoryService";
import { cookies } from "next/headers";
import { UserService } from "@/lib/api/user.service";

const EpisodePlayer = dynamic(() => import("@/components/EpisodePlayer"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse bg-panel rounded-2xl border border-line"></div>
});

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const release = await AnimeService.getReleaseByAlias(params.slug);
  if (!release) return { title: "Аниме не найдено" };
  const title = AnimeService.displayName(release);
  return {
    title,
    description: release.description
      ? release.description.slice(0, 160)
      : `Смотрите ${title} онлайн бесплатно на Anispectra.`,
    openGraph: {
      title,
      description: release.description?.slice(0, 160),
      images: AnimeService.posterUrl(release.poster?.src) ? [AnimeService.posterUrl(release.poster?.src) as string] : [],
    }
  };
}


export default async function AnimeDetailsPage({ params }: { params: { slug: string } }) {
  const release = await AnimeService.getReleaseByAlias(params.slug);
  if (!release) notFound();

  const title = AnimeService.displayName(release);
  const img = AnimeService.posterUrl(release.poster?.src);
  const episodes = release.episodes ?? [];

  const session = await getServerSession(authOptions);
  const cookieStore = cookies();
  const cookieStr = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const aniProfile = await UserService.getProfile(cookieStr).catch(() => null);
  
  const userId = session?.user?.id;
  const aniLibertyId = aniProfile?.id ? String(aniProfile.id) : undefined;
  
  let initialHistory = undefined;
  if (userId || aniLibertyId) {
    const history = await HistoryService.getAnimeHistory({ userId, aniLibertyId }, 100);
    const titleHist = history.find(h => h.titleId === String(release.id));
    if (titleHist) {
      initialHistory = { episode: titleHist.episode, progressSeconds: titleHist.progressSeconds };
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": title,
    "description": release.description || "",
    "image": img || "",
    "genre": release.genres?.map((g) => g.name) || [],
    "datePublished": release.year ? String(release.year) : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-2xl border border-line shadow-glow md:block">
            {img && <Image src={img} alt={title} fill className="object-cover" />}
          </div>

          <div>
            <h1 className="font-display text-3xl font-black text-paper text-balance sm:text-4xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {release.year && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {release.year}
                </span>
              )}
              {release.age_rating?.label && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {release.age_rating.label}
                </span>
              )}
              {release.genres?.map((g) => (
                <Link
                  key={g.id}
                  href={`/anime?genre=${g.id}`}
                  className="rounded-full border border-line px-3 py-1 text-xs text-mist transition hover:border-accent hover:text-accent"
                >
                  {g.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <FavoriteButton
                type="anime"
                id={String(release.id)}
                titleName={title}
                imageSrc={img}
              />
            </div>

            {release.description && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist">{release.description}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-paper">Смотреть онлайн</h2>
          <EpisodePlayer titleId={String(release.id)} episodes={episodes} initialHistory={initialHistory} />
        </div>

        <DisqusComments 
          url={`https://anispectra.uz/anime/${params.slug}`}
          identifier={`anime-${release.id}`}
          title={title}
        />
      </div>
      <FilmDivider />
    </div>
  );
}

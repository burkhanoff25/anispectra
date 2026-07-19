import Image from "next/image";
import { notFound } from "next/navigation";
import EpisodePlayer from "@/components/EpisodePlayer";
import FilmDivider from "@/components/FilmDivider";
import { AnimeService } from "@/lib/api/anime.service";
import type { Metadata } from "next";

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

  return (
    <div>
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
                <span key={g.id} className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {g.name}
                </span>
              ))}
            </div>
            {release.description && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist">{release.description}</p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-paper">Смотреть онлайн</h2>
          <EpisodePlayer titleId={String(release.id)} episodes={episodes} />
        </div>
      </div>
      <FilmDivider />
    </div>
  );
}

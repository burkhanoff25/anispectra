import { notFound } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Metadata } from "next";
import { DoramaService } from "@/lib/api/dorama.service";
import { PlayerService } from "@/lib/api/player.service";
import DisqusComments from "@/components/DisqusComments";
import FilmDivider from "@/components/FilmDivider";
import FavoriteButton from "@/components/FavoriteButton";

const KodikPlayer = dynamic(() => import("@/components/KodikPlayer"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-2xl border border-line bg-panel" />
  ),
});

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const dorama = await DoramaService.getById(Number(params.id));
  if (!dorama) return { title: "Дорама не найдена" };
  const title = DoramaService.displayName(dorama);
  const img = DoramaService.posterUrl(dorama.poster_path);
  return {
    title: `${title} — Anispectra`,
    description: dorama.overview
      ? dorama.overview.slice(0, 160)
      : `Смотрите дораму «${title}» онлайн бесплатно на Anispectra.`,
    openGraph: {
      title,
      description: dorama.overview?.slice(0, 160),
      images: img ? [img] : [],
    },
  };
}

export default async function DoramaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const dorama = await DoramaService.getById(Number(params.id));
  if (!dorama) notFound();

  const title = DoramaService.displayName(dorama);
  const img = DoramaService.posterUrl(dorama.poster_path, "w500");
  const backdrop = DoramaService.backdropUrl(dorama.backdrop_path);
  const flag = DoramaService.countryFlag(dorama.origin_country ?? []);
  const countryName = DoramaService.countryName(dorama.origin_country ?? []);
  const year = dorama.first_air_date?.slice(0, 4);
  const rating = dorama.vote_average ? dorama.vote_average.toFixed(1) : null;

  // Kodik da video qidirish
  const kodikItem = await PlayerService.findDorama(
    title,
    dorama.original_name
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: title,
    description: dorama.overview || "",
    image: img || "",
    genre: dorama.genres?.map((g) => g.name) || [],
    datePublished: dorama.first_air_date || undefined,
    aggregateRating: dorama.vote_average
      ? {
          "@type": "AggregateRating",
          ratingValue: dorama.vote_average.toFixed(1),
          bestRating: "10",
          ratingCount: dorama.vote_count,
        }
      : undefined,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Backdrop */}
      {backdrop && (
        <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-80">
          <Image
            src={backdrop}
            alt={title}
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-base/60 to-base" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-mist">
          <Link href="/dorama" className="hover:text-accent transition">
            Дорамы
          </Link>
          <span>/</span>
          <span className="text-paper">{title}</span>
        </nav>

        <div className="grid gap-8 md:grid-cols-[220px_1fr]">
          {/* Poster */}
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-2xl border border-line shadow-glow md:block">
            {img ? (
              <Image src={img} alt={title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl bg-panel">
                🎬
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start gap-3">
              <span className="text-3xl">{flag}</span>
              <h1 className="font-display text-3xl font-black text-paper text-balance sm:text-4xl">
                {title}
              </h1>
            </div>

            {/* Meta badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {year && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  📅 {year}
                </span>
              )}
              {countryName && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {flag} {countryName}
                </span>
              )}
              {rating && (
                <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  ⭐ {rating} / 10
                </span>
              )}
              {dorama.number_of_seasons && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {dorama.number_of_seasons} сезон
                  {dorama.number_of_seasons > 1 ? "а" : ""}
                </span>
              )}
              {dorama.number_of_episodes && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-mist">
                  {dorama.number_of_episodes} серий
                </span>
              )}
              {dorama.status && (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    dorama.status === "Ended" || dorama.status === "Canceled"
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-green-500/30 bg-green-500/10 text-green-400"
                  }`}
                >
                  {dorama.status === "Returning Series" ||
                  dorama.status === "In Production"
                    ? "🟢 Онгоинг"
                    : dorama.status === "Ended"
                    ? "🔴 Завершена"
                    : dorama.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {dorama.genres && dorama.genres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {dorama.genres.map((g) => (
                  <Link
                    key={g.id}
                    href={`/dorama?genre=${g.id}`}
                    className="rounded-full border border-line px-3 py-1 text-xs text-mist transition hover:border-accent hover:text-accent"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <FavoriteButton
                type="dorama"
                id={String(dorama.id)}
                titleName={title}
                imageSrc={img}
              />
            </div>

            {/* Description */}
            {dorama.overview && (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist">
                {dorama.overview}
              </p>
            )}

            {/* Tagline */}
            {dorama.tagline && (
              <p className="mt-3 text-sm italic text-accent/70">
                «{dorama.tagline}»
              </p>
            )}
          </div>
        </div>

        {/* Player */}
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold text-paper">
            📺 Смотреть онлайн
          </h2>

          {kodikItem ? (
            <KodikPlayer item={kodikItem} />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-panel">
              <div className="text-center text-mist">
                <div className="text-4xl mb-3">🎬</div>
                <p className="font-medium">Видео пока недоступно</p>
                <p className="text-sm mt-1 text-mist/60">
                  Попробуйте зайти позже или поищите на другом ресурсе
                </p>
              </div>
            </div>
          )}
        </div>

        <DisqusComments
          url={`https://anispectra.uz/dorama/${params.id}`}
          identifier={`dorama-${params.id}`}
          title={title}
        />
      </div>
      <FilmDivider />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { DoramaService } from "@/lib/api/dorama.service";
import type { Metadata } from "next";
import type { DoramaItem } from "@/lib/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Дорамы — Anispectra",
  description:
    "Смотрите лучшие корейские, японские и китайские дорамы онлайн на русском языке бесплатно на Anispectra.",
  openGraph: {
    title: "Дорамы — Anispectra",
    description: "Корейские, японские и китайские дорамы на русском онлайн.",
  },
};

function DoramaCard({ item }: { item: DoramaItem }) {
  const title = DoramaService.displayName(item);
  const poster = DoramaService.posterUrl(item.poster_path, "w300");
  const year = item.first_air_date?.slice(0, 4);
  const flag = DoramaService.countryFlag(item.origin_country ?? []);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link
      href={`/dorama/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition-all duration-300 hover:border-accent hover:shadow-glow hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-base">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🎬
          </div>
        )}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-yellow-400 backdrop-blur-sm">
            ⭐ {rating}
          </div>
        )}
        <div className="absolute top-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-sm backdrop-blur-sm">
          {flag}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-paper leading-snug">
          {title}
        </h3>
        {year && (
          <span className="mt-1 text-xs text-mist">{year}</span>
        )}
      </div>
    </Link>
  );
}

export default async function DoramaPage() {
  const [popular, topRated, newDoramas] = await Promise.all([
    DoramaService.getPopular(1),
    DoramaService.getTopRated(1),
    DoramaService.getNew(1),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-paper sm:text-5xl">
          🎭 Дорамы
        </h1>
        <p className="mt-3 max-w-2xl text-mist">
          Корейские, японские и китайские сериалы на русском языке. Субтитры и
          дубляж.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-3">
        {[
          { label: "🇰🇷 Корея", href: "/dorama?country=KR" },
          { label: "🇯🇵 Япония", href: "/dorama?country=JP" },
          { label: "🇨🇳 Китай", href: "/dorama?country=CN" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-line px-4 py-2 text-sm text-mist transition hover:border-accent hover:text-accent"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Popular */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-paper">
            🔥 Популярные
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {popular.results.slice(0, 12).map((item) => (
            <DoramaCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-paper">
            ⭐ Топ рейтинга
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {topRated.results.slice(0, 12).map((item) => (
            <DoramaCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* New */}
      <section className="mb-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-paper">
            🆕 Новинки
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {newDoramas.results.slice(0, 12).map((item) => (
            <DoramaCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

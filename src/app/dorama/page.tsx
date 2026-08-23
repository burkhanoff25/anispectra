import Image from "next/image";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { DoramaService } from "@/lib/api/dorama.service";
import type { Metadata } from "next";
import type { DoramaItem } from "@/lib/types";

export const revalidate = 300;

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

export default async function DoramaPage({
  searchParams,
}: {
  searchParams: { page?: string; genre?: string; q?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const genre = searchParams.genre ? Number(searchParams.genre) : undefined;
  const q = searchParams.q;

  const [catalog, genres] = await Promise.all([
    q ? DoramaService.search(q, page) : DoramaService.getCatalog({ page, genre }),
    DoramaService.getGenres(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-black text-paper">Каталог дорам</h1>
      <p className="mt-2 text-sm text-mist">
        Корейские, японские и китайские сериалы на русском языке.
      </p>

      {/* Search Form */}
      <form action="/dorama" method="GET" className="mt-6 flex max-w-md items-center gap-2">
        <input 
          type="search" 
          name="q" 
          defaultValue={q}
          placeholder="Поиск дорам..." 
          className="w-full rounded-xl border border-line bg-panel px-4 py-2 text-sm text-paper placeholder-mist focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button type="submit" className="rounded-xl bg-violet px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet/90">
          Найти
        </button>
      </form>

      {/* Genre filter */}
      {!q && genres.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/dorama"
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              !genre
                ? "bg-violet text-white"
                : "border border-line text-mist hover:border-accent hover:text-accent"
            }`}
          >
            Все жанры
          </Link>
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/dorama?genre=${g.id}`}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                genre === g.id
                  ? "bg-violet text-white"
                  : "border border-line text-mist hover:border-accent hover:text-accent"
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {catalog.results.length === 0 ? (
        <EmptyState
          title="Ничего не найдено"
          hint={q ? `По запросу "${q}" ничего не найдено.` : "Попробуйте выбрать другой жанр."}
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {catalog.results.map((item) => (
            <DoramaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {catalog.total_pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: Math.min(catalog.total_pages, 10) }).map((_, i) => (
            <Link
              key={i}
              href={`/dorama?page=${i + 1}${genre ? `&genre=${genre}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`h-9 w-9 rounded-full text-center text-sm leading-9 transition ${
                page === i + 1
                  ? "bg-violet text-white"
                  : "border border-line text-mist hover:border-accent hover:text-accent"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

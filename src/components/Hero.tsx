import Image from "next/image";
import Link from "next/link";
import type { AniLibertyRelease } from "@/lib/types";
import { AnimeService } from "@/lib/api/anime.service";
import { truncate } from "@/lib/utils";
import SpectraBar from "./SpectraBar";

export default function Hero({ release }: { release: AniLibertyRelease }) {
  const img = AnimeService.posterUrl(release.poster?.src);
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0">
        {img && (
          <Image
            src={img}
            alt=""
            fill
            priority
            className="object-cover opacity-30 blur-sm scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/40 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-end md:py-20">
        <div className="relative hidden aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-2xl border border-line shadow-glow md:block">
          {img && <Image src={img} alt={AnimeService.displayName(release)} fill className="object-cover" />}
        </div>

        <div className="max-w-2xl animate-rise">
          <SpectraBar className="mb-4 w-14" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            {release.is_ongoing ? "Онлайн-трансляция" : "Сейчас в топе"}
          </p>
          <h1 className="font-display text-3xl font-black leading-tight text-paper text-balance sm:text-5xl">
            {AnimeService.displayName(release)}
          </h1>
          {release.description && (
            <p className="mt-4 text-sm text-mist sm:text-base">{truncate(release.description, 220)}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            {release.genres?.slice(0, 4).map((g) => (
              <span
                key={g.id}
                className="rounded-full border border-line bg-panel/60 px-3 py-1 text-xs text-mist"
              >
                {g.name}
              </span>
            ))}
          </div>
          <Link
            href={`/anime/${release.alias}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-spectra bg-[length:200%_100%] px-6 py-3 font-display text-sm font-bold text-ink shadow-glow transition hover:bg-[length:120%_100%]"
          >
            Смотреть сейчас
          </Link>
        </div>
      </div>
    </section>
  );
}

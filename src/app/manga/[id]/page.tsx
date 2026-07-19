import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MangaService } from "@/lib/api/manga.service";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const manga = await MangaService.getMangaById(params.id);
  if (!manga) return { title: "Манга не найдена" };
  const title = MangaService.mangaTitle(manga);
  const img = MangaService.coverUrl(manga);
  return {
    title,
    description: `Читайте ${title} онлайн на русском на Anispectra.`,
    openGraph: {
      title,
      images: img ? [img] : [],
    }
  };
}


export default async function MangaDetailsPage({ params }: { params: { id: string } }) {
  const manga = await MangaService.getMangaById(params.id);
  if (!manga) notFound();

  const chapters = await MangaService.getMangaChapters(params.id).catch(() => []);
  const title = MangaService.mangaTitle(manga);
  const img = MangaService.coverUrl(manga);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div className="relative hidden aspect-[2/3] overflow-hidden rounded-2xl border border-line shadow-glow md:block">
          {img && <Image src={img} alt={title} fill className="object-cover" />}
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-paper">{title}</h1>
          <div className="mt-8">
            <h2 className="mb-4 font-display text-xl font-bold text-paper">Главы</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/manga/${params.id}/chapter/${ch.id}`}
                  className="rounded-xl border border-line bg-panel p-4 text-center transition hover:border-accent hover:text-accent"
                >
                  Глава {ch.attributes.chapter || "Экстра"}
                </Link>
              ))}
              {chapters.length === 0 && <p className="text-mist">Глав нет</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

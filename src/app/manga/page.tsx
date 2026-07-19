import PosterCard from "@/components/PosterCard";
import EmptyState from "@/components/EmptyState";
import { MangaService } from "@/lib/api/manga.service";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Каталог манги",
  description: "Читайте мангу онлайн на русском. Популярные тайтлы MangaDex с русским переводом."
};


export const revalidate = 3600;

export default async function MangaCatalogPage() {
  const mangaList = await MangaService.getPopularManga(24).catch(() => []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-black text-paper">Манга</h1>

      {mangaList.length === 0 ? (
        <EmptyState title="Каталог пуст" hint="Не удалось загрузить мангу." />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mangaList.map((m) => (
            <PosterCard
              key={m.id}
              href={`/manga/${m.id}`}
              title={MangaService.mangaTitle(m)}
              imageSrc={MangaService.coverUrl(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

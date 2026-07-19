import MangaReader from "@/components/MangaReader";
import type { Metadata } from "next";
import { MangaService } from "@/lib/api/manga.service";

export async function generateMetadata({ params }: { params: { id: string; chapterId: string } }): Promise<Metadata> {
  try {
    const [manga, chapters] = await Promise.all([
      MangaService.getMangaById(params.id),
      MangaService.getMangaChapters(params.id).catch(() => [])
    ]);
    const currentChapter = chapters.find(c => c.id === params.chapterId);
    const chapterNum = currentChapter?.attributes?.chapter || "";
    const title = manga ? MangaService.mangaTitle(manga) : "Манга";
    const displayTitle = chapterNum ? `${title} — Глава ${chapterNum}` : title;
    return {
      title: displayTitle,
      description: `Читать главу ${chapterNum} манги "${title}" онлайн на русском бесплатно на Anispectra.`,
      openGraph: {
        title: displayTitle,
        description: `Читать главу ${chapterNum} манги "${title}" онлайн на русском бесплатно.`,
      }
    };
  } catch (e) {
    return { title: "Читать мангу" };
  }
}

export default function MangaChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  return (
    <div className="py-10">
      <MangaReader mangaId={params.id} chapterId={params.chapterId} />
    </div>
  );
}

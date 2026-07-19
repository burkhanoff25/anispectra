import MangaReader from "@/components/MangaReader";

export default function MangaChapterPage({ params }: { params: { id: string; chapterId: string } }) {
  return (
    <div className="py-10">
      <MangaReader mangaId={params.id} chapterId={params.chapterId} />
    </div>
  );
}

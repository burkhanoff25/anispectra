import { Metadata } from "next";
import { getYoutubeShorts, YoutubeShort } from "@/lib/youtube";
import EmptyState from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Shorts - Anispectra",
  description: "Самые популярные короткие видео с нашего YouTube канала. Аниме моменты, факты и многое другое.",
  openGraph: {
    title: "Shorts - Anispectra",
    description: "Самые популярные короткие видео с нашего YouTube канала. Аниме моменты, факты и многое другое.",
  }
};

export const revalidate = 3600; // Cache for 1 hour

export default async function ShortsPage() {
  const shorts = await getYoutubeShorts().catch(() => []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-paper sm:text-4xl">YouTube Shorts</h1>
        <p className="mt-2 max-w-2xl text-mist">
          Сборник самых популярных коротких видео с нашего канала. Приятного просмотра!
        </p>
      </div>

      {shorts.length > 0 ? (
        // Re-using HeroShorts component here for consistency and grid setup
        // But HeroShorts slices 5 items for the Hero section normally... Wait, I need a separate grid component or modify HeroShorts.
        // Actually, HeroShorts uses `shorts.slice(0, 5)`. We should probably just copy the grid logic or update HeroShorts to accept a prop.
        // Let's implement the grid directly here so we don't break HeroShorts or complicate it.
        <ShortsGrid shorts={shorts} />
      ) : (
        <EmptyState 
          title="Нет видео" 
          hint="Не удалось загрузить Shorts или канал пуст. Зайдите позже." 
        />
      )}
    </main>
  );
}

// Client component wrapper for state
import ShortsGridClient from "./ShortsGridClient";

function ShortsGrid({ shorts }: { shorts: YoutubeShort[] }) {
  return <ShortsGridClient shorts={shorts} />;
}

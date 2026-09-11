import Link from "next/link";
import { Play } from "lucide-react";

interface UzAnimeSlideData {
  id: string;
  title: string;
  poster?: string | null;
  description?: string | null;
  release_year?: number | null;
  genres?: string | null;
  episodeCount: number;
}

export default function UzAnimeHeroSlide({ anime }: { anime: UzAnimeSlideData }) {
  const posterUrl = anime.poster
    ? `/api/proxy/image?url=${encodeURIComponent(anime.poster)}`
    : null;

  const genresText = anime.genres || "Anime";
  const year = anime.release_year || "";

  return (
    <div className="relative w-full h-full group bg-black overflow-hidden">
      {/* Blurred Background Image */}
      {posterUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}
      
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24">
        
        {/* Content on the Left */}
        <div className="w-full md:w-3/5 flex flex-col justify-center h-full py-8">
          {/* O'zbek tilida badge */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-yellow-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">
              🇺🇿 O&apos;zbek tilida dublyaj
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg leading-tight line-clamp-2">
            {anime.title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium text-white opacity-90 mb-2 drop-shadow-sm">
            {year && <span>{year}</span>}
            {year && <span className="w-1 h-1 rounded-full bg-white/50"></span>}
            <span>{anime.episodeCount} qism</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>O&apos;zbek dublyaj</span>
          </div>
          
          <div className="text-xs md:text-sm font-medium text-white opacity-60 mb-6 drop-shadow-sm line-clamp-1">
            {genresText}
          </div>
          
          {anime.description && (
            <p className="text-sm md:text-base max-w-2xl line-clamp-3 md:line-clamp-4 mb-8 drop-shadow-sm leading-relaxed"
               style={{ color: '#e2e8f0' }}
            >
              {anime.description}
            </p>
          )}
          
          <div>
            <Link 
              href={`/uz-anime/${anime.id}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-yellow-400 text-ink font-bold shadow-glow transition hover:opacity-90"
            >
              <Play size={18} fill="currentColor" />
              <span>Tomosha qilish</span>
            </Link>
          </div>
        </div>

        {/* Vertical Poster on the Right */}
        <div className="hidden md:flex w-2/5 justify-end h-full py-6">
          <div className="relative h-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            {posterUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

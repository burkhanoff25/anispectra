import Link from "next/link";
import { Play } from "lucide-react";
import type { AniLibertyRelease } from "@/lib/types";
import { AnimeService } from "@/lib/api/anime.service";

export default function AnimeHeroSlide({ anime }: { anime: AniLibertyRelease }) {
  const bgImage = AnimeService.posterUrl(anime.poster?.src);
  const title = AnimeService.displayName(anime);
  const year = anime.year || "2024";
  const season = anime.season?.description || "Сезон";
  const episodes = anime.episodes_total ? `${anime.episodes_total} эпизодов` : "Онгоинг";
  const age = anime.age_rating?.label || "16+";
  const genres = anime.genres?.map(g => g.name).join(" • ") || "Аниме";
  
  return (
    <div className="relative w-full h-full group bg-black overflow-hidden">
      {/* Blurred Background Image */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:hidden" />

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24">
        
        {/* Content on the Left */}
        <div className="w-full md:w-3/5 flex flex-col justify-center h-full py-8">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg leading-tight line-clamp-2">
            {title}
          </h2>
          
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium text-white opacity-90 mb-2 drop-shadow-sm">
            <span>{season}</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>{year}</span>
            <span className="w-1 h-1 rounded-full bg-white/50"></span>
            <span>{episodes}</span>
            {age && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/50"></span>
                <span>{age}</span>
              </>
            )}
          </div>
          
          <div className="text-xs md:text-sm font-medium text-white opacity-60 mb-6 drop-shadow-sm line-clamp-1">
            {genres}
          </div>
          
          {anime.description && (
            <p className="text-sm md:text-base max-w-2xl line-clamp-3 md:line-clamp-4 mb-8 drop-shadow-sm leading-relaxed"
               style={{ color: '#e2e8f0' }}
               dangerouslySetInnerHTML={{ __html: anime.description }} 
            />
          )}
          
          <div>
            <Link 
              href={`/anime/${anime.alias}`}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md text-white font-medium border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Play size={18} fill="currentColor" />
              <span>Смотреть</span>
            </Link>
          </div>
        </div>

        {/* Vertical Poster on the Right */}
        <div className="hidden md:flex w-2/5 justify-end h-full py-6">
          <div className="relative h-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            {bgImage && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
              />
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

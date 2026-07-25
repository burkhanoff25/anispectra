"use client";

import { useState } from "react";
import Image from "next/image";
import YoutubeModal from "@/components/YoutubeModal";
import type { YoutubeShort } from "@/lib/youtube";

export default function ShortsGridClient({ shorts }: { shorts: YoutubeShort[] }) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Logic for next/prev
  const currentIndex = shorts.findIndex((s) => s.id === activeVideoId);
  const hasNext = currentIndex !== -1 && currentIndex < shorts.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setActiveVideoId(shorts[currentIndex + 1].id);
  };

  const handlePrev = () => {
    if (hasPrev) setActiveVideoId(shorts[currentIndex - 1].id);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {shorts.map((short) => (
          <div 
            key={short.id} 
            className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded-xl bg-panel"
            onClick={() => setActiveVideoId(short.id)}
          >
            {/* Thumbnail */}
            <Image
              src={short.thumbnailUrl}
              alt={short.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
            
            {/* Play Button Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg backdrop-blur-sm transition-transform group-hover:scale-110">
                <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Content info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="line-clamp-2 text-sm font-medium text-white shadow-black drop-shadow-md">
                {short.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-accent shadow-black drop-shadow-md">
                {formatViews(short.viewCount)} просм.
              </p>
            </div>
          </div>
        ))}
      </div>

      <YoutubeModal 
        videoId={activeVideoId || ""} 
        isOpen={!!activeVideoId} 
        onClose={() => setActiveVideoId(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </>
  );
}

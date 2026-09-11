"use client";

import React, { useState, useEffect } from "react";
import CustomHlsPlayer from "./CustomHlsPlayer";

interface UzAnimePlayerProps {
  url: string;
  poster?: string;
  title?: string;
}

/**
 * Extracts Sibnet video ID from various URL formats:
 * - https://video.sibnet.ru/video6277494-AniDonUz/?...
 * - https://video.sibnet.ru/shell.php?videoid=6277494
 * - https://video.sibnet.ru/v/1ff1c463a2010bf644c265e08b3ef184/6237587.mp4
 * - /shell.php?videoid=6277494
 */
function getSibnetEmbedUrl(url: string): string | null {
  if (!url) return null;

  // 1. videoid parameter
  const matchVideoid = url.match(/videoid=(\d+)/i);
  if (matchVideoid) {
    return `https://video.sibnet.ru/shell.php?videoid=${matchVideoid[1]}`;
  }

  // 2. /video12345 pattern
  const matchVideo = url.match(/video(\d+)/i);
  if (matchVideo) {
    return `https://video.sibnet.ru/shell.php?videoid=${matchVideo[1]}`;
  }

  // 3. /v/.../12345.mp4 direct mp4 pattern
  const matchMp4 = url.match(/\/(\d+)\.mp4/i);
  if (matchMp4) {
    return `https://video.sibnet.ru/shell.php?videoid=${matchMp4[1]}`;
  }

  // 4. If URL starts with /shell.php
  if (url.includes("shell.php")) {
    return url.startsWith("http") ? url : `https://video.sibnet.ru${url}`;
  }

  return null;
}

export default function UzAnimePlayer({ url, poster, title }: UzAnimePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [url]);

  if (!url) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-line bg-panel text-mist">
        Video topilmadi
      </div>
    );
  }

  const sibnetEmbed = getSibnetEmbedUrl(url);

  // If it's a Sibnet video, use iframe embed
  if (sibnetEmbed) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-glow">
        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-panel px-4 text-center z-10">
            <p className="text-mist mb-3">Video yuklanmadi yoki manba bloklangan</p>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="rounded-full bg-gradient-to-r from-green-500 to-yellow-400 px-5 py-2 text-sm font-bold text-ink shadow-glow transition hover:opacity-90"
            >
              Qayta urinish
            </button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-panel/80 backdrop-blur-sm z-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-400 border-t-transparent" />
                <span className="mt-3 text-xs text-mist font-medium">Video yuklanmoqda...</span>
              </div>
            )}
            <iframe
              key={sibnetEmbed}
              src={sibnetEmbed}
              title={title || "Video Player"}
              className={`h-full w-full border-0 transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </>
        )}
      </div>
    );
  }

  // If it's an m3u8 or standard video file
  if (url.includes(".m3u8") || url.includes(".mp4")) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border border-line bg-panel shadow-glow">
        <CustomHlsPlayer url={url} poster={poster} autoPlay={false} />
      </div>
    );
  }

  // Fallback iframe for any other embed URLs
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black shadow-glow">
      <iframe
        src={url}
        title={title || "Video Player"}
        className="h-full w-full border-0"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

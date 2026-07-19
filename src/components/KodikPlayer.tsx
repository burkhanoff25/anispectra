"use client";

import { useMemo, useState } from "react";
import type { KodikResultItem } from "@/lib/types";
import { normalizePlayerLink } from "@/lib/utils";

export default function KodikPlayer({ item }: { item: KodikResultItem }) {
  const seasonKeys = useMemo(() => Object.keys(item.seasons ?? {}), [item.seasons]);
  const [season, setSeason] = useState(seasonKeys[0] ?? "");
  const episodeKeys = useMemo(
    () => Object.keys(item.seasons?.[season]?.episodes ?? {}),
    [item.seasons, season]
  );
  const [episode, setEpisode] = useState(episodeKeys[0] ?? "");

  const [iframeError, setIframeError] = useState(false);

  const link =
    item.seasons?.[season]?.episodes?.[episode] ??
    item.seasons?.[season]?.link ??
    item.link;

  if (!link) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-panel text-mist">
        Плеер недоступен для этой дорамы
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-glow">
        {iframeError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-panel text-center px-4">
            <span className="text-mist mb-2">Видео недоступно или заблокировано</span>
            <button 
              onClick={() => setIframeError(false)}
              className="rounded-full bg-violet px-4 py-2 text-white text-sm"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <iframe
            key={link}
            src={normalizePlayerLink(link)}
            className="h-full w-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            onError={() => setIframeError(true)}
          />
        )}
      </div>

      {(seasonKeys.length > 1 || episodeKeys.length > 1) && (
        <div className="mt-4 flex flex-wrap gap-4">
          {seasonKeys.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {seasonKeys.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSeason(s);
                    setEpisode(Object.keys(item.seasons?.[s]?.episodes ?? {})[0] ?? "");
                  }}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    s === season ? "bg-violet text-white" : "border border-line bg-panel text-mist"
                  }`}
                >
                  {s} сезон
                </button>
              ))}
            </div>
          )}
          {episodeKeys.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {episodeKeys.map((e) => (
                <button
                  key={e}
                  onClick={() => setEpisode(e)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                    e === episode ? "bg-violet text-white" : "border border-line bg-panel text-mist"
                  }`}
                >
                  {e} серия
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

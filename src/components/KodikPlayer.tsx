"use client";

import { useMemo, useState, useEffect } from "react";
import type { KodikResultItem } from "@/lib/types";
import { normalizePlayerLink } from "@/lib/utils";

export default function KodikPlayer({ items }: { items: KodikResultItem[] }) {
  const [selectedTransIdx, setSelectedTransIdx] = useState(0);
  const item = items[selectedTransIdx];

  const seasonKeys = useMemo(() => Object.keys(item?.seasons ?? {}), [item?.seasons]);
  const [season, setSeason] = useState(seasonKeys[0] ?? "");
  const episodeKeys = useMemo(
    () => Object.keys(item?.seasons?.[season]?.episodes ?? {}),
    [item?.seasons, season]
  );
  const [episode, setEpisode] = useState(episodeKeys[0] ?? "");

  // Ovoz (tarjima) o'zgarganda 1-fasl va 1-seriyaga qaytarish
  useEffect(() => {
    const sKeys = Object.keys(items[selectedTransIdx]?.seasons ?? {});
    setSeason(sKeys[0] ?? "");
  }, [selectedTransIdx, items]);

  useEffect(() => {
    const eKeys = Object.keys(item?.seasons?.[season]?.episodes ?? {});
    setEpisode(eKeys[0] ?? "");
  }, [season, item]);

  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!item) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-line bg-panel text-mist">
        Плеер недоступен
      </div>
    );
  }

  const link =
    item.seasons?.[season]?.episodes?.[episode] ??
    item.seasons?.[season]?.link ??
    item.link;

  // Link o'zgarganda loading holatini qayta tiklaymiz
  useEffect(() => {
    setIsLoading(true);
    setIframeError(false);
  }, [link]);

  const proxyLink = link ? `/api/player/proxy?url=${encodeURIComponent(link)}` : "";

  return (
    <div>
      {/* Tarjimalar / Ovozlar ro'yxati */}
      {items.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((it, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedTransIdx(idx)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                idx === selectedTransIdx
                  ? "bg-violet text-white"
                  : "border border-line bg-panel text-mist hover:text-white"
              }`}
            >
              {it.translation?.title || "Оригинал"}
            </button>
          ))}
        </div>
      )}

      {/* Player (Iframe) */}
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black shadow-glow">
        {iframeError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-panel text-center px-4 z-10">
            <span className="text-mist mb-2">Видео недоступно или заблокировано</span>
            <button 
              onClick={() => {
                setIframeError(false);
                setIsLoading(true);
              }}
              className="rounded-full bg-violet px-4 py-2 text-white text-sm"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          proxyLink ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-panel z-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet border-t-transparent" />
                </div>
              )}
              <iframe
                key={proxyLink}
                src={proxyLink}
                className={`h-full w-full transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setIframeError(true);
                }}
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-mist">
              Видео не найдено
            </div>
          )
        )}
      </div>

      {/* Fasl va Seriyalar ro'yxati */}
      {(seasonKeys.length > 1 || episodeKeys.length > 1) && (
        <div className="mt-4 flex flex-wrap gap-4">
          {seasonKeys.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {seasonKeys.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
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

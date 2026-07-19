"use client";

import { useState, useEffect } from "react";

interface MangaReaderProps {
  chapterId: string;
  mangaId?: string;
}

export default function MangaReader({ chapterId, mangaId }: MangaReaderProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Calling backend proxy instead of direct API
    fetch(`/api/manga/pages?chapterId=${chapterId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setPages(data.pages ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [chapterId]);

  // --- History Tracking Hook ---
  useEffect(() => {
    if (!mangaId || pages.length === 0) return;

    const interval = setInterval(() => {
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "manga",
          mangaId,
          chapter: chapterId,
          page: currentPage,
        })
      }).catch(err => console.error("Failed to sync manga history", err));
    }, 15000); // Sync every 15s

    return () => clearInterval(interval);
  }, [mangaId, chapterId, currentPage, pages]);

  // Intersection Observer for pages
  useEffect(() => {
    if (pages.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const pageNum = parseInt(entry.target.getAttribute("data-page") || "1", 10);
          setCurrentPage((prev) => Math.max(prev, pageNum));
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll(".manga-page").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pages]);
  // -----------------------------

  if (loading) return <div className="p-8 text-center text-mist">Загрузка страниц...</div>;
  if (error || pages.length === 0) return <div className="p-8 text-center text-mist">Не удалось загрузить мангу.</div>;

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-2">
      <div className="mb-2 w-full text-center text-sm text-mist">
        Страница {currentPage} из {pages.length}
      </div>
      {pages.map((url, i) => (
        <div key={i} data-page={i + 1} className="manga-page relative w-full overflow-hidden bg-base">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Page ${i + 1}`}
            className="h-auto w-full"
            loading={i < 3 ? "eager" : "lazy"}
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0.3";
            }}
          />
        </div>
      ))}
    </div>
  );
}

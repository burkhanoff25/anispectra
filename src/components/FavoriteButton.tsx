"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  type: "anime" | "manga";
  id: string;
  titleName: string;
  imageSrc: string | null;
}

export default function FavoriteButton({ type, id, titleName, imageSrc }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkFavorite() {
      try {
        const res = await fetch(`/api/favorites?type=${type}&id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setIsFav(data.isFavorited);
        }
      } catch (err) {
        console.error("Error checking favorite:", err);
      } finally {
        setLoading(false);
      }
    }
    checkFavorite();
  }, [type, id]);

  const toggleFavorite = async () => {
    try {
      setLoading(true);
      const method = isFav ? "DELETE" : "POST";
      const res = await fetch("/api/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, titleName, imageSrc }),
      });

      if (res.status === 401) {
        // Redirect to profile page for authentication
        router.push("/profile");
        return;
      }

      if (res.ok) {
        setIsFav(!isFav);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isFav) {
    return (
      <button 
        disabled
        className="flex items-center gap-2 rounded-xl border border-line bg-panel/40 px-4 py-2.5 text-sm font-bold text-mist/60 cursor-not-allowed"
      >
        <Star className="h-4 w-4 animate-pulse" />
        Загрузка...
      </button>
    );
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition shadow-sm ${
        isFav
          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 shadow-yellow-500/10"
          : "border-line bg-panel hover:border-yellow-500/30 hover:text-yellow-400 transition"
      }`}
    >
      <Star className={`h-4 w-4 ${isFav ? "fill-yellow-400" : ""}`} />
      <span>{isFav ? "В избранном" : "В избранное"}</span>
    </button>
  );
}

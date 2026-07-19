"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function SearchBox() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(val: string) {
    setValue(val);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const q = val.trim();
      if (q) {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      } else {
        router.push(`/search`);
      }
    }, 300);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        type="search"
        name="q"
        placeholder="Найти аниме или мангу…"
        className="w-full rounded-full border border-line bg-panel px-4 py-2 text-sm text-paper placeholder:text-mist/70 outline-none transition focus:border-violet"
      />
    </form>
  );
}

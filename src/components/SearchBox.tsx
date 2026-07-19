"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

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
    <form onSubmit={onSubmit} role="search" className="relative flex items-center">
      <Search className="absolute left-3.5 h-4 w-4 text-mist/70 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        type="search"
        name="q"
        placeholder="Найти аниме или мангу…"
        className="w-full rounded-full border border-line bg-panel pl-10 pr-4 py-2 text-sm text-paper placeholder:text-mist/70 outline-none transition focus:border-violet focus:bg-panel2"
      />
    </form>
  );
}

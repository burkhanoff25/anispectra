"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-ink px-4 text-center text-paper py-20">
      <div>
        <p className="font-display text-2xl font-bold">Что-то пошло не так</p>
        <p className="mt-2 text-sm text-mist">Попробуйте обновить страницу.</p>
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-violet px-6 py-2 text-sm font-semibold text-white transition hover:bg-violet/90"
        >
          Обновить
        </button>
      </div>
    </div>
  );
}

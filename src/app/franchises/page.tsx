import { AnimeService } from "@/lib/api/anime.service";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

export const revalidate = 3600;

export default async function FranchisesPage() {
  const data = await AnimeService.getFranchises().catch(() => null);

  // Example API response: [{ id: "...", name: "..." }]
  const franchises = Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-black text-paper">Франшизы</h1>

      {franchises.length === 0 ? (
        <EmptyState title="Франшизы не найдены" hint="Список франшиз временно недоступен." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {franchises.map((f: { id: string; name: string }) => (
            <Link
              key={f.id}
              href={`/franchises/${f.id}`}
              className="flex items-center rounded-xl border border-line bg-panel p-4 transition hover:border-paper hover:shadow-glow"
            >
              <span className="font-display font-medium text-paper">{f.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

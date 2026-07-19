import { UserService } from "@/lib/api/user.service";
import EmptyState from "@/components/EmptyState";

export const revalidate = 0;

export default async function CollectionsPage() {
  const favorites = await UserService.getFavoritesReleases().catch(() => null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-black text-paper">Избранное</h1>

      {!favorites ? (
        <EmptyState title="Избранное недоступно" hint="Авторизуйтесь, чтобы увидеть свои коллекции." />
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-6 shadow-glow">
          <p className="text-mist">Здесь будут отображаться ваши коллекции.</p>
        </div>
      )}
    </div>
  );
}

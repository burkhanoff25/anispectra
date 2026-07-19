import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <EmptyState
        title="Страница не найдена"
        hint="Возможно, тайтл был удалён или ссылка устарела."
      />
      <div className="text-center">
        <Link href="/" className="text-sm font-medium text-violet hover:text-paper">
          ← На главную
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function ShelfRow({
  title,
  seeAllHref,
  seeAllLabel,
  children
}: {
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-display text-lg font-bold text-paper sm:text-xl">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="text-sm font-medium text-green-400 hover:text-paper">
            {seeAllLabel || "Смотреть всё →"}
          </Link>
        )}
      </div>
      <div className="shelf-track -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {children}
      </div>
    </section>
  );
}

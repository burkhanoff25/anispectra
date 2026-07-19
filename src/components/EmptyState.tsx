export default function EmptyState({
  title,
  hint
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
      <div className="film-divider mx-auto mb-6 w-40" />
      <p className="font-display text-lg font-bold text-paper">{title}</p>
      {hint && <p className="mt-2 text-sm text-mist">{hint}</p>}
    </div>
  );
}

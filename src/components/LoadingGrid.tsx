export default function LoadingGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[2/3] rounded-xl bg-panel2" />
          <div className="mt-2 h-3 w-3/4 rounded bg-panel2" />
        </div>
      ))}
    </div>
  );
}

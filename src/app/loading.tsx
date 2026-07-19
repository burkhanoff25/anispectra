import LoadingGrid from "@/components/LoadingGrid";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <LoadingGrid count={18} />
    </div>
  );
}

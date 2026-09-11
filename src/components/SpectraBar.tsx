export default function SpectraBar({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-[3px] w-9 rounded-full bg-spectra bg-[length:200%_100%] animate-drift shadow-[0_0_8px_rgba(34,197,94,0.6)] ${className}`}
      aria-hidden
    />
  );
}

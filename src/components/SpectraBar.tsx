export default function SpectraBar({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-[3px] w-9 rounded-full bg-spectra bg-[length:200%_100%] animate-drift ${className}`}
      aria-hidden
    />
  );
}

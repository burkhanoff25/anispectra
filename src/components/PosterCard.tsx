import Image from "next/image";
import Link from "next/link";

export default function PosterCard({
  href,
  title,
  subtitle,
  imageSrc,
  badge
}: {
  href: string;
  title: string;
  subtitle?: string;
  imageSrc: string | null;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group w-[150px] shrink-0 snap-start sm:w-[170px] focus-visible:outline-none"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-line bg-panel shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="170px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-panel2 px-2 text-center text-xs text-mist">
            {title}
          </div>
        )}
        {badge && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-teal ring-1 ring-teal/40">
            {badge}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-ink/0 opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-2">
        <p className="line-clamp-2 text-sm font-semibold text-paper">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-mist">{subtitle}</p>}
      </div>
    </Link>
  );
}

import Link from "next/link";
import SpectraBar from "./SpectraBar";
import SearchBox from "./SearchBox";

const NAV = [
  { href: "/anime", label: "Аниме" },
  { href: "/manga", label: "Манга" },
  { href: "/schedule", label: "Расписание" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" className="flex flex-col leading-none shrink-0">
          <span className="font-display text-xl font-extrabold tracking-tight text-paper">
            Anispectra
          </span>
          <SpectraBar className="mt-1" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-mist transition hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/profile"
            className="hidden items-center rounded-xl border border-line bg-panel px-4 py-2 text-sm font-bold text-mist transition hover:border-accent hover:text-accent md:flex"
          >
            Профиль
          </Link>
          <SearchBox />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-mist hover:bg-panel2 hover:text-paper"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

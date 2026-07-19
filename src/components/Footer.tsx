import SpectraBar from "./SpectraBar";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-panel/40 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div>
            <SpectraBar />
            <p className="mt-3 max-w-md text-sm text-mist">
              Anispectra — витрина для аниме и манги. Видео предоставляется через AniLiberty,
              страницы манги — через MangaDex. Мы не храним видеофайлы на своих серверах.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-paper uppercase tracking-wider text-xs">Навигация</span>
              <Link href="/anime" className="text-mist hover:text-accent transition">Аниме</Link>
              <Link href="/manga" className="text-mist hover:text-accent transition">Манга</Link>
              <Link href="/schedule" className="text-mist hover:text-accent transition">Расписание</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="font-semibold text-paper uppercase tracking-wider text-xs">Помощь</span>
              <Link href="/support" className="text-mist hover:text-accent transition">Поддержка (DMCA)</Link>
              <a href="https://t.me/anispectra" target="_blank" rel="noreferrer" className="text-mist hover:text-accent transition">Telegram</a>
              <a href="mailto:support@anispectra.com" className="text-mist hover:text-accent transition">Email</a>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-line/50 pt-6 text-xs text-mist/70">
          © {new Date().getFullYear()} Anispectra. Все права на контент принадлежат их
          правообладателям. Наш ресурс содержит исключительно ссылки, взятые из открытых API.
        </p>
      </div>
    </footer>
  );
}

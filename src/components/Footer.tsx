import SpectraBar from "./SpectraBar";

export default function Footer() {
  return (
    <footer className="border-t border-line/70 bg-panel/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SpectraBar />
        <p className="mt-3 max-w-xl text-sm text-mist">
          Anispectra — витрина для аниме и манги. Видео предоставляется через AniLiberty,
          страницы манги — через MangaDex. Мы не храним видеофайлы на своих серверах.
        </p>
        <p className="mt-6 text-xs text-mist/70">
          © {new Date().getFullYear()} Anispectra. Все права на контент принадлежат их
          правообладателям.
        </p>
      </div>
    </footer>
  );
}

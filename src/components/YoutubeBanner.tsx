import Link from "next/link";

export default function YoutubeBanner() {
  return (
    <div className="w-full h-full relative group bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <svg className="mx-auto h-12 w-12 text-white mb-3 sm:mb-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
        </svg>
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl leading-tight">
          Подписывайтесь на наш YouTube канал!
        </h2>
        <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-sm sm:text-base text-white/90">
          Не пропустите эксклюзивные аниме-релизы, интересные шортсы и новости от команды Anispectra.
        </p>
        <div className="mt-4 sm:mt-6 flex justify-center">
          <Link 
            href="https://youtube.com/@anispectrajp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="group relative flex items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm sm:text-base font-bold text-red-600 bg-white shadow-xl transition-transform hover:scale-105">
              <span className="absolute inset-0 bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
                </svg>
                Подписаться
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

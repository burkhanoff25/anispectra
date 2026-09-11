import Link from "next/link";

export default function UzAnimeBanner() {
  return (
    <div className="w-full h-full relative group bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-5xl flex flex-col items-start justify-center h-full px-4 md:px-12">
        <span className="mb-3 rounded-full border border-blue-400/40 bg-blue-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
          Maxsus Bo&apos;lim
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight mb-4 shadow-black drop-shadow-md">
          O&apos;zbek Tilidagi Animelar
        </h2>
        <p className="max-w-xl text-sm sm:text-lg text-white/90 mb-8 drop-shadow-sm font-medium">
          Eng so&apos;nggi va sara animelarni o&apos;zbek tilida tomosha qiling. Sifatli tarjima va dublyaj faqat Anispectra&apos;da!
        </p>
        <Link href="/uz-anime">
          <button className="group relative flex items-center justify-center overflow-hidden rounded-full px-8 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
            <span className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Tomosha qilish
            </span>
          </button>
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function SupportProject() {
  return (
    <section className="w-full h-full">
      <div className="relative w-full h-full flex items-center justify-between overflow-hidden bg-ink px-6 sm:px-12 border border-white/5">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/30 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-12">
          
          {/* Left Text Content */}
          <div className="flex-1 w-full max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 sm:mb-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-white tracking-widest uppercase">Поддержка</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 sm:mb-4 leading-tight">
              Ваш вклад <br className="hidden sm:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">создает будущее</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed max-w-xl" style={{ color: '#e2e8f0' }}>
              Anispectra создается и поддерживается благодаря вам. Помогите нам оплачивать сервера и развивать новые крутые функции! Любая сумма помогает нам стать лучше. ❤️
            </p>
          </div>

          {/* Right Buttons - Glassmorphic Cards */}
          <div className="flex flex-col gap-3 w-full sm:max-w-xs shrink-0">
            {/* Tinkoff Button */}
            <Link 
              href="https://www.tinkoff.ru/rm/r_TTuIWxZwQs.HLuLZKOYgh/dnVzR47613"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-yellow-400/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(250,204,21,0.3)] backdrop-blur-md"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-400 shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-400 transition-colors">Tinkoff / СБП</span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">Быстрый перевод</span>
                </div>
              </div>
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 group-hover:text-yellow-400 transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* DonationAlerts Button */}
            <Link 
              href="https://www.donationalerts.com/r/burkhanoff"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 transition-all duration-300 hover:bg-white/10 hover:border-[#ff8c00]/50 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(255,140,0,0.3)] backdrop-blur-md"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#ff8c00]/20 text-[#ff8c00] shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff8c00] transition-colors">DonationAlerts</span>
                  <span className="text-[10px] sm:text-xs text-zinc-400">Для зарубежа</span>
                </div>
              </div>
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 group-hover:text-[#ff8c00] transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

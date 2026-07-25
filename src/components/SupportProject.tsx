import Link from "next/link";

export default function SupportProject() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-panel via-ink to-panel px-6 py-12 shadow-2xl ring-1 ring-white/10 sm:px-12 sm:py-16">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-[80px]"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]"></div>

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Поддержите развитие проекта
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-mist">
            Anispectra создается и поддерживается благодаря вам. Если вам нравится то, что мы делаем, вы можете помочь нам оплачивать сервера и развивать новые крутые функции!
          </p>

          {/* QR Code Section */}
          <div className="mx-auto mt-8 flex max-w-xs flex-col items-center justify-center rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
            <p className="mb-4 text-center text-sm font-medium text-white/80">Отсканируйте для быстрого перевода<br/>(Tinkoff / СБП)</p>
            <div className="overflow-hidden rounded-xl bg-white p-2 shadow-lg">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.tinkoff.ru/rm/r_TTuIWxZwQs.HLuLZKOYgh/dnVzR47613" 
                alt="QR Code for Tinkoff" 
                className="h-32 w-32 object-cover"
                width={128}
                height={128}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Tinkoff Button */}
            <Link 
              href="https://www.tinkoff.ru/rm/r_TTuIWxZwQs.HLuLZKOYgh/dnVzR47613"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="group relative flex w-full items-center justify-center overflow-hidden rounded-full p-4 px-8 font-medium text-white bg-blue-600 shadow-lg shadow-blue-600/30 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black sm:w-auto">
                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Перейти по ссылке Тинькофф
              </button>
            </Link>

            {/* DonationAlerts Button */}
            <Link 
              href="https://www.donationalerts.com/r/burkhanoff"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="group relative flex w-full items-center justify-center overflow-hidden rounded-full p-4 px-8 font-medium text-black bg-[#ff8c00] shadow-lg shadow-[#ff8c00]/30 transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ff8c00] focus:ring-offset-2 focus:ring-offset-black sm:w-auto">
                <span className="absolute inset-0 bg-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                Поддержать через DonationAlerts
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-mist/60">
            Любая сумма поможет нам стать лучше. Спасибо, что вы с нами! ❤️
          </p>
        </div>
      </div>
    </section>
  );
}

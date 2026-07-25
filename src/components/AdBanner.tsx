import Link from "next/link";
import { PenTool, Monitor, Video, Megaphone, Send } from "lucide-react";

export default function AdBanner() {
  return (
    <div className="w-full h-full relative group bg-gradient-to-br from-zinc-900 to-black flex items-center justify-between p-4 sm:p-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-lime-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute left-0 bottom-0 w-[250px] h-[250px] bg-lime-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>
      
      <div className="relative z-10 flex flex-col justify-center h-full max-w-2xl">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <div className="text-lime-400 font-black text-xl tracking-tighter">D/</div>
          <div className="text-[10px] sm:text-xs font-bold text-zinc-400 tracking-widest uppercase leading-tight">
            Графика &<br />Моушн-дизайнер
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.1] mb-2 sm:mb-3 uppercase">
          Превращу ваши идеи в <br />
          <span className="text-lime-400">визуальную реальность</span>
        </h2>
        
        <p className="text-zinc-400 text-xs sm:text-sm max-w-xl mb-4 sm:mb-5">
          Креативный дизайн и динамичные моушн-решения для брендов, рекламы и цифровых продуктов.
        </p>

        <div className="flex gap-4 sm:gap-6 hidden sm:flex">
          <div className="flex flex-col items-center gap-1.5">
            <PenTool className="w-5 h-5 text-lime-400" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-tight">Логотипы &<br/>Брендинг</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Monitor className="w-5 h-5 text-lime-400" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-tight">Веб & UI<br/>Дизайн</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Video className="w-5 h-5 text-lime-400" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-tight">Моушн<br/>Дизайн</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Megaphone className="w-5 h-5 text-lime-400" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase text-center leading-tight">Рекламные<br/>Визуалы</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-end justify-center">
        <Link 
          href="https://t.me/JkhanYT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group/btn flex items-center gap-2 sm:gap-3 bg-lime-400 hover:bg-lime-300 text-black font-extrabold px-4 py-3 sm:px-6 sm:py-3.5 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(163,230,53,0.3)] mb-3 sm:mb-4 text-xs sm:text-sm"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:rotate-12 transition-transform" />
          ДЛЯ СОТРУДНИЧЕСТВА
        </Link>
        <div className="text-right flex flex-col gap-0.5">
          <span className="text-lime-400 font-black text-base sm:text-lg">+998 90 534 23 09</span>
          <span className="text-white text-xs sm:text-sm font-medium">@jkhanbakhromov</span>
        </div>
      </div>
    </div>
  );
}

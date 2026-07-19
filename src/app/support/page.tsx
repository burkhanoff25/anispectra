"use client";

import { useState } from "react";
import { 
  Send, HelpCircle, Mail, MessageSquare, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp 
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "Почему плеер зависает или не грузит видео?",
    a: "Видеопоток поступает из внешнего API AniLiberty/Anilibria. Попробуйте изменить качество (например, с 1080p на 720p или 480p) в настройках плеера. Также это может быть связано с перегрузкой внешних CDN-серверов в часы пик.",
  },
  {
    q: "Как сохраняется моя история просмотра?",
    a: "Если вы авторизованы через Google, ваша история просмотров аниме и чтения манги автоматически синхронизируется в облаке. История просмотров сохраняется каждые 10 секунд воспроизведения видео.",
  },
  {
    q: "Можно ли скачать аниме или мангу на вашем сайте?",
    a: "Наш проект является витриной и плеером, агрегирующим бесплатные данные. Скачивание контента напрямую с сайта не поддерживается, все ресурсы воспроизводятся в реальном времени.",
  },
  {
    q: "Я автор контента, и хочу подать жалобу (DMCA). Что делать?",
    a: "Anispectra не хранит файлы на своих серверах, а лишь встраивает их из публичных источников. Тем не менее, мы уважаем авторские права. Напишите нам на почту, и мы оперативно заблокируем отображение данного контента.",
  },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-black text-paper sm:text-5xl">
          Поддержка & Обратная связь
        </h1>
        <p className="mt-3 text-sm text-mist sm:text-base max-w-2xl mx-auto">
          Возникли проблемы с видео, авторизацией или хотите сообщить об ошибке? 
          Мы всегда на связи.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-glow">
          <h2 className="mb-6 font-display text-xl font-bold text-paper flex items-center gap-2">
            <MessageSquare className="text-accent h-5 w-5" />
            Написать сообщение
          </h2>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-rise">
              <CheckCircle2 className="h-16 w-16 text-teal mb-4" />
              <h3 className="text-lg font-bold text-paper">Сообщение отправлено!</h3>
              <p className="mt-2 text-sm text-mist max-w-md">
                Спасибо за обращение. Мы ответим вам на указанный адрес электронной почты в ближайшее время.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 rounded-xl bg-surface border border-line px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent transition"
              >
                Отправить ещё раз
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-mist">Ваше имя</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван"
                  className="w-full rounded-xl border border-line bg-base px-4 py-3 text-paper focus:border-accent focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-mist">Электронная почта</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full rounded-xl border border-line bg-base px-4 py-3 text-paper focus:border-accent focus:outline-none transition"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-mist">Сообщение</label>
                <textarea 
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Опишите вашу проблему или предложение..."
                  className="w-full rounded-xl border border-line bg-base px-4 py-3 text-paper focus:border-accent focus:outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Send size={16} />
                    Отправить сообщение
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info & FAQ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Quick contacts */}
          <div className="rounded-3xl border border-line bg-panel p-6 shadow-glow">
            <h3 className="mb-4 font-display text-[15px] font-bold text-paper uppercase tracking-wider">
              Быстрые контакты
            </h3>
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:support@anispectra.com" 
                className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm text-mist hover:text-paper border border-transparent hover:border-line transition"
              >
                <Mail className="text-accent h-5 w-5" />
                <span>support@anispectra.com</span>
              </a>
              <a 
                href="https://t.me/anispectra" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl bg-surface p-3 text-sm text-mist hover:text-paper border border-transparent hover:border-line transition"
              >
                <MessageSquare className="text-teal h-5 w-5" />
                <span>Наш Telegram Канал</span>
              </a>
            </div>
          </div>

          {/* DMCA / Copyright */}
          <div className="rounded-3xl border border-line bg-panel p-6 shadow-glow">
            <h3 className="mb-3 font-display text-[15px] font-bold text-paper uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="text-yellow-500 h-5 w-5" />
              Правообладателям (DMCA)
            </h3>
            <p className="text-xs leading-relaxed text-mist">
              Anispectra осуществляет поиск и индексирование открытых ссылок, транслируя медиафайлы с сторонних платформ. 
              Мы не загружаем и не храним материалы на своих серверах. По любым вопросам удаления обратитесь на 
              <a href="mailto:dmca@anispectra.com" className="text-accent hover:underline ml-1">dmca@anispectra.com</a>.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 rounded-3xl border border-line bg-panel p-6 sm:p-8 shadow-glow">
        <h2 className="mb-8 font-display text-2xl font-bold text-paper flex items-center gap-2">
          <HelpCircle className="text-teal h-6 w-6" />
          Часто задаваемые вопросы (FAQ)
        </h2>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="overflow-hidden rounded-2xl border border-line bg-surface/50"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-4 text-left font-semibold text-paper hover:bg-surface transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {isOpen && (
                  <div className="border-t border-line/50 p-4 text-sm text-mist leading-relaxed animate-rise">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

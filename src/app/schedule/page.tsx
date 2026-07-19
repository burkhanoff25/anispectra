import PosterCard from "@/components/PosterCard";
import { AnimeService } from "@/lib/api/anime.service";
import EmptyState from "@/components/EmptyState";
import type { AniLibertyRelease } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Расписание выхода серий",
  description: "Расписание выхода серий аниме на неделе. Узнайте, когда выйдут новые эпизоды ваших любимых онгоингов."
};


export const revalidate = 300;

export default async function SchedulePage() {
  const data = await AnimeService.getScheduleWeek().catch(() => null);

  // The API returns an array of schedule objects, e.g., [{ day: 0, list: [...] }, { day: 1, list: [...] }]
  const schedule = Array.isArray(data) ? data : [];

  const daysOfWeek = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-black text-paper">Расписание выхода серий</h1>

      {schedule.length === 0 ? (
        <EmptyState title="Расписание пусто" hint="Не удалось загрузить данные о расписании." />
      ) : (
        <div className="flex flex-col gap-12">
          {schedule.map((dayData: { day: number; list: AniLibertyRelease[] }) => (
            <section key={dayData.day}>
              <h2 className="mb-4 font-display text-xl font-bold text-paper border-b border-line pb-2">
                {daysOfWeek[dayData.day] ?? `День ${dayData.day}`}
              </h2>
              {dayData.list && dayData.list.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {dayData.list.map((r) => (
                    <PosterCard
                      key={r.id}
                      href={`/anime/${r.alias}`}
                      title={AnimeService.displayName(r)}
                      subtitle={r.year ? String(r.year) : undefined}
                      imageSrc={AnimeService.posterUrl(r.poster?.src)}
                      badge={r.is_ongoing ? "Онлайн" : undefined}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-mist text-sm">В этот день нет релизов.</p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

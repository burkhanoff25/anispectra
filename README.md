# Anispectra

Аниме, дорамы и манга онлайн. Полностью на бесплатных данных:

- **Аниме** — [AniLiberty API v1](https://anilibria.top/api/docs/v1) (публичный, без ключа), собственный HLS-плеер (`hls.js`).
- **Дорамы** — [Kodik API](https://kodikapi.com), iframe-плеер с выбором сезона/серии. Требует токен.
- **Манга** — [MangaDex API](https://api.mangadex.org) (публичный, без ключа), постраничная читалка.

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Запуск локально

```bash
npm install
cp .env.example .env.local
npm run dev
```

Откройте http://localhost:3000

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните:

| Переменная | Обязательна | Описание |
|---|---|---|
| `KODIK_API_TOKEN` | да, для раздела «Дорамы» | Токен доступа к Kodik API. Используется только на сервере, никогда не попадает в браузер. |
| `NEXT_PUBLIC_ANILIBERTY_BASE` | нет | Базовый URL AniLiberty API, по умолчанию `https://anilibria.top/api/v1` |
| `NEXT_PUBLIC_KODIK_BASE` | нет | Базовый URL Kodik API, по умолчанию `https://kodikapi.com` |
| `NEXT_PUBLIC_MANGADEX_BASE` | нет | Базовый URL MangaDex API |
| `NEXT_PUBLIC_MANGADEX_UPLOADS` | нет | Хост изображений MangaDex |

## Деплой на Vercel

1. Загрузите проект в свой репозиторий на GitHub.
2. Импортируйте репозиторий на [vercel.com/new](https://vercel.com/new).
3. В настройках проекта (Settings → Environment Variables) добавьте `KODIK_API_TOKEN` со своим значением.
4. Нажмите Deploy.

## Структура проекта

```
src/
  app/
    page.tsx            — главная (Hero + подборки)
    anime/               — каталог и страница аниме с плеером
    dorama/              — каталог и страница дорамы с Kodik-плеером
    manga/                — каталог, страница тайтла и читалка глав
    search/              — общий поиск по всем трём разделам
  components/            — переиспользуемые UI-компоненты
  lib/                   — клиенты API (anilibria.ts, kodik.ts, mangadex.ts)
```

## Важно про ошибки и пустые состояния

Каждый API-клиент (`src/lib/*.ts`) перехватывает сетевые сбои и возвращает пустой
результат вместо исключения — страницы вместо краша показывают понятное
пустое состояние («Не удалось загрузить…») благодаря компоненту `EmptyState`.
Это сделано специально, чтобы сайт не падал в проде, если один из трёх
внешних API временно недоступен.

## Дисклеймер

Anispectra не хранит видео или файлы манги на своих серверах — только
встраивает готовые плееры и изображения сторонних сервисов (AniLiberty,
Kodik, MangaDex). Права на весь контент принадлежат правообладателям.

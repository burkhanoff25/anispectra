import { Bot, InlineKeyboard } from "grammy";
import { prisma } from "@/server/db/client";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not defined!");
}

export const bot = new Bot(token || "8341326272:AAHHByCB3AHZkYeWTn-Cetl5dK-uMhKiD9A");

// Middleware to automatically register user
bot.use(async (ctx, next) => {
  if (ctx.from) {
    try {
      await prisma.telegramUser.upsert({
        where: { id: BigInt(ctx.from.id) },
        update: {
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        },
        create: {
          id: BigInt(ctx.from.id),
          username: ctx.from.username,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
        },
      });
    } catch (e) {
      console.error("Error upserting TelegramUser:", e);
    }
  }
  return next();
});

const mainMenuKeyboard = new InlineKeyboard()
  .webApp("🌐 Открыть AniSpectra", "https://anispectra.uz").row()
  .text("🔍 Поиск", "cmd_find").row()
  .text("📺 Онгоинги", "cmd_ongoing")
  .text("🎲 Случайное", "cmd_random").row()
  .text("📋 Мои подписки", "cmd_list").row()
  .text("📅 Расписание", "cmd_calendar")
  .text("💬 Поддержка", "cmd_bug");

bot.command("start", async (ctx) => {
  // Set the main menu button next to the input field
  await ctx.api.setChatMenuButton({
    chat_id: ctx.chat.id,
    menu_button: {
      type: "web_app",
      text: "Смотреть",
      web_app: { url: "https://anispectra.uz" }
    }
  });

  await ctx.reply(
    "Привет! Я официальный бот AniSpectra 🎌\n\nЗдесь ты можешь искать аниме, дорамы и мангу, а также управлять своими подписками на новые серии.\n\nНажми на одну из кнопок ниже или отправь /help для справки.",
    { reply_markup: mainMenuKeyboard }
  );
});

bot.command("menu", async (ctx) => {
  await ctx.reply("Главное меню:", { reply_markup: mainMenuKeyboard });
});

bot.command("help", async (ctx) => {
  const helpText = `
*Список доступных команд:*
/start — Перезапустить бота
/menu — Главное меню
/help — Эта справка
/find <название> — Найти релиз (или /f)
/random — Случайное аниме/дорама/манга
/ongoing — Список онгоингов
/list — Список ваших подписок
/add <название> — Подписаться на уведомления
/remove <название> — Отписаться от уведомлений
/calendar — Расписание выхода
/bug <текст> — Написать в поддержку
/site — Ссылка на сайт (Mini App)
  `;
  await ctx.reply(helpText, { parse_mode: "Markdown" });
});

// Porting existing /site command
bot.command("site", async (ctx) => {
  const siteKeyboard = new InlineKeyboard()
    .webApp("🚀 Открыть приложение", "https://anispectra.uz");
    
  await ctx.reply(
    `🌐 Наш официальный сайт: https://anispectra.uz\nСмотрите лучшие аниме и дорамы бесплатно прямо в Telegram!`,
    { parse_mode: "HTML", reply_markup: siteKeyboard }
  );
});

import { AnimeService } from "@/lib/api/anime.service";
import { DoramaService } from "@/lib/api/dorama.service";
import { MangaService } from "@/lib/api/manga.service";

bot.command(["find", "f"], async (ctx) => {
  const query = ctx.match;
  if (!query) {
    return ctx.reply("Пожалуйста, укажите название после команды, например: /find Наруто");
  }

  await ctx.reply("🔍 Ищу в базе...");
  try {
    const [animes, doramas, mangas] = await Promise.all([
      AnimeService.searchReleases(query),
      DoramaService.search(query),
      MangaService.searchManga(query),
    ]);

    let text = `Результаты по запросу *${query}*:\n\n`;
    
    if (animes.length > 0) {
      text += `*Аниме:*\n`;
      animes.slice(0, 3).forEach((a: any) => {
        text += `— [${AnimeService.displayName(a)}](https://anispectra.uz/anime/${a.alias})\n`;
      });
      text += `\n`;
    }
    
    if (doramas.results && doramas.results.length > 0) {
      text += `*Дорамы:*\n`;
      doramas.results.slice(0, 3).forEach((d: any) => {
        text += `— [${DoramaService.displayName(d)}](https://anispectra.uz/dorama/${d.id})\n`;
      });
      text += `\n`;
    }

    if (mangas && mangas.length > 0) {
      text += `*Манга:*\n`;
      mangas.slice(0, 3).forEach((m: any) => {
        text += `— [${MangaService.mangaTitle(m)}](https://anispectra.uz/manga/${m.id})\n`;
      });
      text += `\n`;
    }

    if (animes.length === 0 && (!doramas.results || doramas.results.length === 0) && (!mangas || mangas.length === 0)) {
      text = "К сожалению, ничего не найдено 😔";
    }

    await ctx.reply(text, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
  } catch (e) {
    console.error(e);
    await ctx.reply("Произошла ошибка при поиске.");
  }
});

bot.command("random", async (ctx) => {
  await ctx.reply("🎲 Подбираю случайное аниме...");
  try {
    const randoms = await AnimeService.getRandomReleases();
    if (randoms.length > 0) {
      const a = randoms[0];
      const img = AnimeService.posterUrl(a.poster?.src);
      const text = `*${AnimeService.displayName(a)}*\n\n[Смотреть на сайте](https://anispectra.uz/anime/${a.alias})`;
      if (img) {
        await ctx.replyWithPhoto(img, { caption: text, parse_mode: "Markdown" });
      } else {
        await ctx.reply(text, { parse_mode: "Markdown" });
      }
    }
  } catch (e) {
    await ctx.reply("Произошла ошибка.");
  }
});

bot.command("ongoing", async (ctx) => {
  await ctx.reply("📺 Загружаю онгоинги...");
  try {
    const latest = await AnimeService.getLatestReleases(5);
    let text = `*Последние онгоинги:*\n\n`;
    latest.forEach(a => {
      text += `— [${AnimeService.displayName(a)}](https://anispectra.uz/anime/${a.alias})\n`;
    });
    await ctx.reply(text, { parse_mode: "Markdown", link_preview_options: { is_disabled: true } });
  } catch (e) {
    await ctx.reply("Произошла ошибка.");
  }
});

bot.command("add", async (ctx) => {
  const query = ctx.match;
  if (!query) return ctx.reply("Укажите тип и ID для подписки, например: /add anime naruto");
  const [type, releaseId] = query.split(" ");
  if (!type || !releaseId || !["anime", "dorama", "manga"].includes(type)) {
    return ctx.reply("Формат: /add [anime|dorama|manga] [id]");
  }

  try {
    if (!ctx.from) return;
    let titleName = releaseId;
    let imageSrc = "";

    if (type === "anime") {
      const a = await AnimeService.getReleaseByAlias(releaseId);
      if (a) { titleName = AnimeService.displayName(a); imageSrc = AnimeService.posterUrl(a.poster?.src) || ""; }
    } else if (type === "dorama") {
      const d = await DoramaService.getById(Number(releaseId));
      if (d) { titleName = DoramaService.displayName(d); imageSrc = DoramaService.posterUrl(d.poster_path) || ""; }
    } else if (type === "manga") {
      const ms = await MangaService.searchManga(releaseId);
      if (ms && ms.length > 0) { titleName = MangaService.mangaTitle(ms[0]); }
    }

    await prisma.telegramSubscription.upsert({
      where: { telegramUserId_type_releaseId: { telegramUserId: BigInt(ctx.from.id), type, releaseId } },
      update: {},
      create: {
        telegramUserId: BigInt(ctx.from.id),
        type,
        releaseId,
        titleName,
        imageSrc
      }
    });
    await ctx.reply(`✅ Вы успешно подписались на уведомления о выходе новых серий: *${titleName}*`, { parse_mode: "Markdown" });
  } catch (e) {
    console.error(e);
    await ctx.reply("Произошла ошибка при подписке.");
  }
});

bot.command("remove", async (ctx) => {
  const query = ctx.match;
  if (!query) return ctx.reply("Укажите тип и ID для отписки, например: /remove anime naruto");
  const [type, releaseId] = query.split(" ");
  try {
    if (!ctx.from) return;
    await prisma.telegramSubscription.delete({
      where: { telegramUserId_type_releaseId: { telegramUserId: BigInt(ctx.from.id), type, releaseId } }
    });
    await ctx.reply(`✅ Вы отписались от уведомлений.`);
  } catch (e) {
    await ctx.reply("Подписка не найдена или произошла ошибка.");
  }
});

bot.command("list", async (ctx) => {
  if (!ctx.from) return;
  const subs = await prisma.telegramSubscription.findMany({
    where: { telegramUserId: BigInt(ctx.from.id) }
  });
  if (subs.length === 0) {
    return ctx.reply("У вас пока нет подписок.");
  }
  
  let text = "*Ваши подписки:*\n\n";
  const kb = new InlineKeyboard();
  
  subs.forEach((s, i) => {
    text += `${i+1}. ${s.titleName} (${s.type})\n`;
    kb.text(`❌ Отписаться от ${i+1}`, `unsub_${s.type}_${s.releaseId}`).row();
  });
  await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb });
});

bot.on("callback_query:data", async (ctx, next) => {
  const data = ctx.callbackQuery.data;
  
  if (data.startsWith("unsub_")) {
    const parts = data.split("_");
    const type = parts[1];
    const releaseId = parts.slice(2).join("_");
    try {
      await prisma.telegramSubscription.delete({
        where: { telegramUserId_type_releaseId: { telegramUserId: BigInt(ctx.callbackQuery.from.id), type, releaseId } }
      });
      await ctx.answerCallbackQuery({ text: "✅ Вы отписались!" });
      // Remove button or edit message (simplified)
      await ctx.editMessageReplyMarkup({ reply_markup: new InlineKeyboard() });
    } catch (e) {
      await ctx.answerCallbackQuery({ text: "Ошибка или уже отписаны." });
    }
    return;
  }
  
  if (data === "cmd_find") return ctx.reply("Отправьте команду /find <название>");
  if (data === "cmd_ongoing") return ctx.api.sendMessage(ctx.callbackQuery.from.id, "/ongoing"); // Trigger ongoing
  if (data === "cmd_random") return ctx.api.sendMessage(ctx.callbackQuery.from.id, "/random");
  if (data === "cmd_list") return ctx.api.sendMessage(ctx.callbackQuery.from.id, "/list");
  if (data === "cmd_calendar") return ctx.api.sendMessage(ctx.callbackQuery.from.id, "/calendar");
  if (data === "cmd_bug") return ctx.reply("Для связи с поддержкой отправьте: /bug <сообщение>");

  await next();
});

bot.command("calendar", async (ctx) => {
  await ctx.reply("📅 Расписание:\n(Скоро будет добавлено)");
});

bot.command(["bug", "support"], async (ctx) => {
  const text = ctx.match;
  if (!text) return ctx.reply("Укажите текст обращения после команды.");
  // Usually you would send this to a specific group chat or save to DB.
  // We can save it as SupportTicket in Prisma.
  try {
    if (!ctx.from) return;
    const user = await prisma.telegramUser.findUnique({ where: { id: BigInt(ctx.from.id) }});
    if (!user || !user.userId) {
      return ctx.reply("Пожалуйста, сначала привяжите свой аккаунт на сайте, чтобы использовать поддержку.");
    }
    
    await prisma.supportTicket.create({
      data: {
        userId: user.userId,
        message: text,
      }
    });
    await ctx.reply("✅ Ваше сообщение отправлено администрации.");
  } catch(e) {
    await ctx.reply("Произошла ошибка при отправке.");
  }
});

// Porting existing support reply logic
bot.on("message:text", async (ctx, next) => {
  const replyTo = ctx.message.reply_to_message;
  if (replyTo && replyTo.message_id) {
    const repliedMessageId = replyTo.message_id;
    const adminText = ctx.message.text;

    // Find the ticket that has this telegramMessageId
    const ticket = await prisma.supportTicket.findFirst({
      where: { telegramMessageId: repliedMessageId },
      include: { user: true }
    });

    if (ticket) {
      // Create the reply in our database
      await prisma.supportReply.create({
        data: {
          ticketId: ticket.id,
          message: adminText,
        }
      });

      // Update ticket status
      await prisma.supportTicket.update({
        where: { id: ticket.id },
        data: { status: 'REPLIED' }
      });

      await ctx.reply(`✅ Ответ доставлен пользователю ${ticket.user.name || ticket.user.email}.`, {
        reply_parameters: { message_id: ctx.message.message_id }
      });
      return; // Handled
    }
  }
  
  await next();
});

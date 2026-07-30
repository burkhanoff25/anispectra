async function run() {
    const res = await fetch("https://anilibria.top/api/v1/anime/releases/latest?limit=1");
    const releases = await res.json();
    const release = releases[0];
    
    const title = release.name.main || release.name.english || "Без названия";
    const url = `https://anispectra.uz/anime/${release.alias || release.id}`;
    let img = null;
    if (release.poster?.src) {
        const src = release.poster.src;
        img = src.startsWith("http") ? src : `https://anilibria.top${src.startsWith("/") ? "" : "/"}${src}`;
    }
    
    let text = `🔥 <b>Yangi qism: ${title}</b>\n\n`;
    if (release.description) {
      text += `${release.description.slice(0, 150)}...\n\n`;
    }
    text += `👉 <a href="${url}">Saytda ko'rish</a>\n\n`;
    text += `💬 <a href="https://t.me/Anispectra_uz">@Anispectra_uz</a> | 🛠 <a href="https://t.me/anispectra_support_bot">Yordam Bot</a>`;

    const telegramApiUrl = img 
      ? `https://api.telegram.org/bot8629351464:AAGjMEgJZsdYd3DTzkM2J8oXNb0EdvqADAA/sendPhoto` 
      : `https://api.telegram.org/bot8629351464:AAGjMEgJZsdYd3DTzkM2J8oXNb0EdvqADAA/sendMessage`;
    
    const payload = {
      chat_id: "-1004410113145",
      parse_mode: "HTML",
      ...(img ? { photo: img, caption: text } : { text, link_preview_options: { is_disabled: true } })
    };

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(await response.text());
    } else {
        console.log("Successfully posted:", title);
    }
}
run();

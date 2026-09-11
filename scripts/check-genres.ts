import { AniHubScraper } from '../src/services/anihub-scraper';

async function main() {
  const url = 'https://www.anihub.top/anime/40d978c5-2f61-46da-b122-b4d95d1abbde-naruto';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();

  const matches = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g);
  let fullUnescaped = "";
  if (matches) {
    for (const m of matches) {
      const inner = m.substring(24, m.length - 3);
      try { fullUnescaped += JSON.parse(`"${inner}"`); } catch (e) {}
    }
  }

  // Look for any genres or categories in full text
  const genreWords = fullUnescaped.match(/"genre[^"]*":(\[[^\]]+\]|"[^"]+")/gi);
  console.log("Genre fields found:", genreWords);

  // Also check category or tags
  const tagWords = fullUnescaped.match(/"category":[^,}]+/gi);
  console.log("Category fields found:", tagWords);

  // Check what categories exist on AniHub catalog page
  const catRes = await fetch("https://www.anihub.top/catalog", { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const catHtml = await catRes.text();
  const genrePills = catHtml.match(/genre=[^"&']+/g) || catHtml.match(/category=[^"&']+/g) || [];
  console.log("Genre query params in catalog:", Array.from(new Set(genrePills)));
}

main();

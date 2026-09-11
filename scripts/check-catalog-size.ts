async function checkCatalogSize() {
  console.log("Checking AniHub catalog size...");
  const res = await fetch("https://www.anihub.top/catalog", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const html = await res.text();

  // Search for pagination or total indicators
  const matches = html.match(/page=(\d+)/g) || [];
  const numbers = matches.map(m => parseInt(m.replace("page=", ""), 10));
  const maxPage = numbers.length > 0 ? Math.max(...numbers) : 1;
  console.log("Found pagination links:", Array.from(new Set(matches)));
  console.log("Max visible page in catalog:", maxPage);

  // Check how many items appear on page 1
  const animeLinks = (html.match(/\/anime\/[a-zA-Z0-9_-]+/g) || [])
    .filter(x => x.length > 8);
  const uniqueOnPage = Array.from(new Set(animeLinks));
  console.log("Anime links on page 1:", uniqueOnPage.length);

  // Check subsequent pages to see where pages end
  let lastValidPage = 1;
  for (let p = 2; p <= 15; p++) {
    const pageRes = await fetch(`https://www.anihub.top/catalog?page=${p}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    const pageHtml = await pageRes.text();
    const links = (pageHtml.match(/\/anime\/[a-zA-Z0-9_-]+/g) || []).filter(x => x.length > 8);
    const unique = Array.from(new Set(links));
    if (unique.length === 0) {
      console.log(`Page ${p} has 0 animes (catalog ends at page ${p - 1})`);
      break;
    } else {
      console.log(`Page ${p}: ${unique.length} animes`);
      lastValidPage = p;
    }
  }

  console.log(`\nEstimated total in AniHub catalog: around ${lastValidPage} pages.`);
}

checkCatalogSize();

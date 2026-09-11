async function findMaxPages() {
  let low = 15;
  let high = 60;
  let totalAnimes = 0;

  for (let p of [20, 30, 40, 50]) {
    const res = await fetch(`https://www.anihub.top/catalog?page=${p}`, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const links = (html.match(/\/anime\/[a-zA-Z0-9_-]+/g) || []).filter(x => x.length > 8);
    const unique = Array.from(new Set(links));
    console.log(`Page ${p} has ${unique.length} animes`);
  }
}
findMaxPages();

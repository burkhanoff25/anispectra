async function inspectBackend() {
  const res = await fetch("https://www.anihub.top/catalog", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
  });
  const html = await res.text();

  // Find backend domain or endpoints
  const apiMatches = html.match(/https?:\/\/[a-zA-Z0-9.-]+(\/api\/[a-zA-Z0-9_\-\/]+)/g);
  console.log("API endpoints in HTML:", apiMatches ? Array.from(new Set(apiMatches)) : "none");

  // Find fetch URLs in JS bundles
  const scriptTags = html.match(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g) || [];
  console.log("Chunk scripts:", scriptTags.slice(0, 3));

  // Let's check sitemap.xml on AniHub!
  const sitemapRes = await fetch("https://www.anihub.top/sitemap.xml", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  console.log("Sitemap status:", sitemapRes.status);
  if (sitemapRes.ok) {
    const sitemapText = await sitemapRes.text();
    const animeUrls = sitemapText.match(/https:\/\/www\.anihub\.top\/anime\/[^\s<"]+/g) || [];
    console.log("Total animes in AniHub sitemap.xml:", animeUrls.length);
    if (animeUrls.length > 0) {
      console.log("Sample from sitemap:", animeUrls.slice(0, 5));
    }
  }

  // Let's also check robots.txt
  const robotsRes = await fetch("https://www.anihub.top/robots.txt");
  if (robotsRes.ok) {
    console.log("Robots.txt:\n", await robotsRes.text());
  }
}

inspectBackend();

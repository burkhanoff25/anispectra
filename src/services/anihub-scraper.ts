import * as cheerio from 'cheerio';

export interface ScrapedAnime {
  id: string;
  title: string;
  poster?: string;
  description?: string;
  release_year?: number;
  genres?: string;
  episodes: ScrapedEpisode[];
}

export interface ScrapedEpisode {
  episode_number: number;
  title?: string;
  stream_url: string; // The direct mp4 url or the sibnet iframe url
}

export class AniHubScraper {
  
  /**
   * Fetches the catalog page and extracts the anime links.
   */
  static async fetchAnimeLinks(page = 1): Promise<string[]> {
    const url = `https://www.anihub.top/catalog?page=${page}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const links: string[] = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('/anime/')) {
        const fullUrl = `https://www.anihub.top${href}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
    });
    
    return links;
  }

  /**
   * Scrapes anime details and episodes from its page.
   */
  static async fetchAnimeDetails(animeUrl: string): Promise<ScrapedAnime | null> {
    try {
      const res = await fetch(animeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await res.text();
      
      // Extract JSON payload from __next_f script tags
      const matches = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g);
      let fullUnescaped = "";
      if (matches) {
        for (const m of matches) {
          const inner = m.substring(24, m.length - 3); 
          try { fullUnescaped += JSON.parse(`"${inner}"`); } catch (e) {}
        }
      }

      // Helper function to extract a balanced JSON object by key
      const extractObjectByKey = (str: string, key: string) => {
        const searchKey = `"${key}":{`;
        const startIndex = str.indexOf(searchKey);
        if (startIndex === -1) return null;
        
        let objStart = startIndex + searchKey.length - 1;
        let braces = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = objStart; i < str.length; i++) {
          const char = str[i];
          if (escapeNext) { escapeNext = false; continue; }
          if (char === '\\') { escapeNext = true; continue; }
          if (char === '"') { inString = !inString; continue; }
          
          if (!inString) {
            if (char === '{') braces++;
            if (char === '}') {
              braces--;
              if (braces === 0) return str.substring(objStart, i + 1);
            }
          }
        }
        return null;
      };

      const objStr = extractObjectByKey(fullUnescaped, "anime");
      let animeData: any = null;
      if (objStr) {
        try {
          animeData = JSON.parse(objStr);
        } catch(e) {
          console.log("Failed to parse the extracted object");
        }
      }

      if (!animeData) {
        return null;
      }

      let genresStr = "";
      if (animeData.genres && Array.isArray(animeData.genres)) {
        genresStr = animeData.genres
          .map((g: any) => g.name_uz || g.name_ru || g.name || g)
          .filter(Boolean)
          .join(", ");
      } else if (animeData.genre && Array.isArray(animeData.genre)) {
        genresStr = animeData.genre.join(", ");
      }

      const scraped: ScrapedAnime = {
        id: animeData.id,
        title: animeData.title_uz || animeData.title_ru || animeData.title_original || "Unknown",
        poster: animeData.poster,
        description: animeData.description_uz || animeData.description_ru,
        release_year: animeData.year,
        genres: genresStr || undefined,
        episodes: []
      };

      if (animeData.episodes && Array.isArray(animeData.episodes)) {
        for (const ep of animeData.episodes) {
          let sibnetUrl = '';
          if (ep.sources && ep.sources.length > 0) {
            const sibnetSource = ep.sources.find((s: any) => s.provider === 'sibnet');
            if (sibnetSource) {
              sibnetUrl = sibnetSource.url;
            } else {
              sibnetUrl = ep.sources[0].url; // fallback
            }
          }

          if (sibnetUrl) {
            let streamUrl = sibnetUrl;
            if (streamUrl.startsWith("/")) {
              streamUrl = `https://video.sibnet.ru${streamUrl}`;
            }

            scraped.episodes.push({
              episode_number: ep.episode_number,
              title: ep.title_uz || ep.title_en || `${ep.episode_number}-qism`,
              stream_url: streamUrl
            });
          }
        }
      }

      return scraped;
    } catch (e) {
      console.error(`Error scraping ${animeUrl}:`, e);
      return null;
    }
  }

  /**
   * Searches AniHub catalog for anime matching query.
   */
  static async searchAnime(query: string): Promise<string[]> {
    try {
      const url = `https://www.anihub.top/catalog?search=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await res.text();
      const matches = html.match(/\/anime\/[a-zA-Z0-9_-]+/g) || [];
      const links: string[] = [];
      for (const m of matches) {
        const fullUrl = `https://www.anihub.top${m}`;
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
      return links;
    } catch (e) {
      console.error("AniHub search error:", e);
      return [];
    }
  }

  /**
   * Converts a sibnet iframe URL (e.g. /shell.php?videoid=...) into a direct mp4 URL
   */
  static async getSibnetDirectUrl(sibnetUrl: string): Promise<string | null> {
    try {
      // Normalize url
      let url = sibnetUrl;
      if (!url.startsWith('http')) {
        url = `https://video.sibnet.ru${url}`;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await response.text();

      const regex = /player\.src\(\[\{src:\s*["'](\/v\/.*?)["']/i;
      const match = html.match(regex);

      if (match && match[1]) {
        const videoPath = match[1];
        return `https://video.sibnet.ru${videoPath}`;
      }
      return null;
    } catch (error) {
      console.error("Sibnet parser xatosi:", error);
      return null;
    }
  }
}

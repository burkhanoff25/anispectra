import { AniHubScraper } from '@/services/anihub-scraper';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== ANIHUB FULL CATALOG IMPORT (50+ ANIMES) ===");

  const allLinks = new Set<string>();

  // 1. Gather links from catalog pages
  for (let page = 1; page <= 5; page++) {
    console.log(`Fetching catalog page ${page}...`);
    const links = await AniHubScraper.fetchAnimeLinks(page);
    links.forEach(l => allLinks.add(l));
  }

  // 2. Also gather popular anime via search terms to get maximum coverage
  const searchTerms = ['a', 'o', 'naruto', 'tokio', 'qasoskorlari', 'shilliq', 'titan', 're:zero', 'qilich'];
  for (const term of searchTerms) {
    const searchLinks = await AniHubScraper.searchAnime(term);
    searchLinks.forEach(l => allLinks.add(l));
  }

  const urlsToProcess = Array.from(allLinks);
  console.log(`\nFound ${urlsToProcess.length} unique anime titles to import.\n`);

  let successCount = 0;

  for (let i = 0; i < urlsToProcess.length; i++) {
    const url = urlsToProcess[i];
    try {
      process.stdout.write(`[${i + 1}/${urlsToProcess.length}] Scraping: ${url.split('/').pop()} ... `);
      
      const data = await AniHubScraper.fetchAnimeDetails(url);
      if (!data || !data.title) {
        console.log("SKIP (No data)");
        continue;
      }

      // Upsert Anime
      let anime = await prisma.anime.findFirst({
        where: { title: data.title }
      });

      if (anime) {
        anime = await prisma.anime.update({
          where: { id: anime.id },
          data: {
            poster: data.poster || anime.poster,
            description: data.description || anime.description,
            release_year: data.release_year || anime.release_year,
          }
        });
      } else {
        anime = await prisma.anime.create({
          data: {
            title: data.title,
            poster: data.poster,
            description: data.description,
            release_year: data.release_year,
          }
        });
      }

      // Insert/Update Episodes in batches
      if (data.episodes && data.episodes.length > 0) {
        for (const ep of data.episodes) {
          const existingEp = await prisma.episode.findFirst({
            where: {
              anime_id: anime.id,
              episode_number: ep.episode_number,
            }
          });

          if (existingEp) {
            await prisma.episode.update({
              where: { id: existingEp.id },
              data: {
                title: ep.title,
                stream_url: ep.stream_url,
                last_checked_at: new Date()
              }
            });
          } else {
            await prisma.episode.create({
              data: {
                anime_id: anime.id,
                episode_number: ep.episode_number,
                title: ep.title,
                stream_url: ep.stream_url
              }
            });
          }
        }
      }

      console.log(`OK: "${data.title}" (${data.episodes.length} ep)`);
      successCount++;

      // Small delay to be polite
      await new Promise(r => setTimeout(r, 400));
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n=== IMPORT COMPLETE: Successfully imported ${successCount} animes ===`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

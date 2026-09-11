import { AniHubScraper } from '../src/services/anihub-scraper';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Fetching anime links from AniHub catalog...");
  const links = await AniHubScraper.fetchAnimeLinks(1);
  console.log(`Found ${links.length} animes on page 1.`);

  // Let's just process the first 3 as a test to avoid spamming
  const testLinks = links.slice(0, 3);

  for (const url of testLinks) {
    console.log(`\nScraping: ${url}`);
    const data = await AniHubScraper.fetchAnimeDetails(url);
    
    if (!data) {
      console.log(`Failed to parse data for ${url}`);
      continue;
    }

    console.log(`Parsed: ${data.title} (${data.episodes.length} episodes)`);

    // Upsert anime by title
    let anime = await prisma.anime.findFirst({
      where: { title: data.title }
    });

    if (anime) {
      anime = await prisma.anime.update({
        where: { id: anime.id },
        data: {
          poster: data.poster,
          description: data.description,
          release_year: data.release_year,
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

    console.log(`Saved Anime: ${anime.id} - ${anime.title}`);

    // Insert episodes
    for (const ep of data.episodes) {
      // Check if episode already exists for this anime + episode_number
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
    console.log(`Saved ${data.episodes.length} episodes for ${anime.title}`);
    
    // Delay to prevent getting blocked
    await new Promise(r => setTimeout(r, 2000));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const animes = await prisma.anime.findMany({
    include: {
      episodes: true
    }
  });

  console.log("ANIMES COUNT:", animes.length);
  for (const a of animes) {
    console.log({
      id: a.id,
      title: a.title,
      poster: a.poster,
      episodesCount: a.episodes.length,
      firstEpisodeStream: a.episodes[0]?.stream_url
    });
  }
}

main().finally(() => prisma.$disconnect());

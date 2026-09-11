import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Searching for mock anime...");
  
  // Find anime with Naruto or Jujutsu Kaisen mock titles
  const mockAnimes = await prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: "Naruto", mode: "insensitive" } },
        { title: { contains: "Jujutsu", mode: "insensitive" } },
        { title: { contains: "English", mode: "insensitive" } }
      ]
    }
  });

  console.log(`Found ${mockAnimes.length} mock animes:`, mockAnimes.map(a => a.title));

  for (const anime of mockAnimes) {
    // Delete related episodes first
    await prisma.episode.deleteMany({
      where: { anime_id: anime.id }
    });
    // Delete anime
    await prisma.anime.delete({
      where: { id: anime.id }
    });
    console.log(`Deleted: ${anime.title} (${anime.id})`);
  }

  const remaining = await prisma.anime.findMany({
    select: { id: true, title: true }
  });
  console.log("Remaining animes:", remaining);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

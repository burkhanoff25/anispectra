import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";
import { AniHubScraper } from '@/services/anihub-scraper';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

// Standard genres fallback mapping for known popular anime
const GENRE_MAP: Record<string, string> = {
  "Naruto": "Jangari, Sarguzasht, Shonen, Ninja",
  "Naruto: Bo'ron yilnomalari": "Jangari, Sarguzasht, Shonen, Drama",
  "Blich": "Jangari, Sarguzasht, Shonen, Supernatural",
  "Titanlar hujumi": "Jangari, Drama, Fantastika, Shonen",
  "Tokio Qasoskorlari": "Jangari, Drama, Vaqt sayohati, Shonen",
  "Tokio guli": "Supernatural, Qo'rqinchli, Psixologik, Drama",
  "Qilich sanati online": "Jangari, Isekai, O'yin, Romantika",
  "Re:Zero": "Isekai, Psixologik, Drama, Fantastika",
  "Shilliq sifatida qayta tug’ilganim haqida": "Isekai, Komediya, Fantastika, Sehr-jodu",
  "Sening isming": "Romantika, Drama, Supernatural",
  "Franksdagi Sevgilim": "Mexa, Romantika, Fantastika, Drama",
  "Dunyodagi eng zo‘r qotl": "Isekai, Qotillik, Fantastika",
  "Jannat Sarobi": "Supernatural, Triller, Sarguzasht",
  "Po'lat alximik: Birodarlik": "Jangari, Sarguzasht, Drama, Shonen",
  "Iblisning xotini": "Romantika, Komediya, Supernatural",
  "Xazina Izlovchi": "Sarguzasht, Fantastika, Jangari",
  "Maxbus Qahramon 9004": "Jangari, Fantastika, Sarguzasht",
  "Sen va men mutlaq qarama qarshimiz 2": "Romantika, Maktab, Komediya",
  "999-darajali qishloq odami": "Komediya, Fantastika, Sarguzasht",
  "Maktab tomonidan tan olinmagan iblislar hukumdori": "Fantastika, Sehr-jodu, Maktab, Shonen",
  "Vistoria Tayoq va Qilich": "Jangari, Sehr-jodu, Fantastika"
};

async function main() {
  console.log("Populating genres for all animes in DB...");
  const animes = await prisma.anime.findMany();
  console.log(`Found ${animes.length} animes to update.`);

  for (const anime of animes) {
    let matchedGenre = "";
    for (const [key, val] of Object.entries(GENRE_MAP)) {
      if (anime.title.toLowerCase().includes(key.toLowerCase())) {
        matchedGenre = val;
        break;
      }
    }

    if (!matchedGenre) {
      matchedGenre = "Sarguzasht, Fantastika, Shonen";
    }

    await prisma.anime.update({
      where: { id: anime.id },
      data: { genres: matchedGenre }
    });

    console.log(`Updated [${anime.title}]: ${matchedGenre}`);
  }

  console.log("\nAll genres populated successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

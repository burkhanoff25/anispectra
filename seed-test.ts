import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing records...');
  await prisma.anime.deleteMany();

  console.log('Seeding test anime...');
  const naruto = await prisma.anime.create({
    data: {
      title: "Naruto: Shippuden (English)",
      poster: "https://anilibria.top/storage/releases/posters/8800/XJ5G3M4H5E9R_1.jpg",
      description: "Uzumaki Naruto o'zining qishlog'iga qaytib, kuchliroq bo'lgan holda Akatsuki tashkilotiga qarshi kurashishni boshlaydi. Uning maqsadi — do'sti Sasukeni qutqarish va Xokage bo'lish.",
      release_year: 2007,
      episodes: {
        create: [
          {
            episode_number: 1,
            title: "Uyga qaytish",
            // A sample public m3u8 test stream for the video
            stream_url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          }
        ]
      }
    }
  });

  const jujutsu = await prisma.anime.create({
    data: {
      title: "Jujutsu Kaisen (English)",
      poster: "https://anilibria.top/storage/releases/posters/9156/P2K8M9V4L1C_1.jpg",
      description: "Yuji Itadori tasodifan la'natlangan barmoqni yutib yuboradi va Sukuna deb ataluvchi yovuz ruhning idishiga aylanadi.",
      release_year: 2020,
    }
  });

  console.log('Seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

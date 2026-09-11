import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Adding genres column to Anime table if not exists...");
  await prisma.$executeRawUnsafe(`ALTER TABLE "Anime" ADD COLUMN IF NOT EXISTS "genres" TEXT;`);
  console.log("Column 'genres' added successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

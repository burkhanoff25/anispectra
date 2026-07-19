import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  
  let cleanUrl = url;
  let authToken: string | undefined = undefined;
  
  if (url.includes("?authToken=")) {
    const parts = url.split("?authToken=");
    cleanUrl = parts[0];
    authToken = parts[1];
  }
  
  const adapter = new PrismaLibSql({ url: cleanUrl, authToken });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

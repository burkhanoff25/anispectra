import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrismaClient() {
  let url = process.env.DATABASE_URL ?? "file:./dev.db";
  let authToken: string | undefined = undefined;

  // Self-correct if the user pasted only the Turso JWT token into DATABASE_URL
  if (url.startsWith("ey") && url.includes(".")) {
    authToken = url;
    url = "libsql://anispectra-burkhanoff25.aws-ap-northeast-1.turso.io";
  } else if (url.includes("?authToken=")) {
    const parts = url.split("?authToken=");
    url = parts[0];
    authToken = parts[1];
  }

  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

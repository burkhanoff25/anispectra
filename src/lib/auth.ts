import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/client";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
      allowDangerousEmailAccountLinking: true,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error("Необходимо указать email и код.");
        }

        const { email, otp } = credentials;

        // Check if token exists and matches
        const tokenRecord = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: otp,
          },
        });

        if (!tokenRecord) {
          throw new Error("Неверный код.");
        }

        if (new Date() > tokenRecord.expires) {
          // Token expired, delete it
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: email,
                token: otp,
              },
            },
          });
          throw new Error("Код истёк.");
        }

        // Token is valid. Delete it so it can't be reused.
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: email,
              token: otp,
            },
          },
        });

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0], // Default name from email
            },
          });
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

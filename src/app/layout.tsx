import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const display = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "900"],
  variable: "--font-display"
});

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: {
    default: "Anispectra — аниме и манга онлайн",
    template: "%s | Anispectra"
  },
  description:
    "Anispectra: смотрите аниме онлайн и читайте мангу бесплатно. Свежие релизы, удобный плеер, история просмотра.",
  metadataBase: new URL("https://anispectra.vercel.app"),
  openGraph: {
    siteName: "Anispectra",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-ink text-paper antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

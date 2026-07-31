import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ConditionalFooter from "@/components/ConditionalFooter";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

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

export const viewport: Viewport = {
  themeColor: "#050208",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Anispectra — аниме и манга",
    template: "%s | Anispectra"
  },
  description:
    "Anispectra: смотрите аниме онлайн и читайте мангу бесплатно. Свежие релизы, удобный плеер, история просмотра.",
  keywords: ["аниме", "манга", "смотреть аниме", "читать мангу", "аниме онлайн", "аниме бесплатно", "anime", "manga", "anispectra", "аниспектра", "аниме на русском", "манга на русском", "новые серии аниме"],
  authors: [{ name: "Anispectra" }],
  creator: "Anispectra",
  publisher: "Anispectra",
  metadataBase: new URL("https://anispectra.uz"),
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Anispectra",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/icon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/icon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152" },
      { url: "/icons/icon-180x180.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "Anispectra — аниме и манга",
    description: "Anispectra: смотрите аниме онлайн и читайте мангу бесплатно. Свежие релизы, удобный плеер, история просмотра.",
    url: "https://anispectra.uz",
    siteName: "Anispectra",
    type: "website",
    locale: "ru_RU",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anispectra — аниме и манга",
    description: "Anispectra: смотрите аниме онлайн и читайте мангу бесплатно. Свежие релизы, удобный плеер, история просмотра.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'hdYUKiHpQKzyvzF-sBnfzR_CEWnu6p9NfSJstHqZcCs',
    yandex: '9ee519ae2d9fb53d',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-ink text-paper antialiased min-h-screen flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
        </Providers>
        <Analytics />
        <SpeedInsights />

        {/* PWA Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) { console.log('Service Worker registration successful'); },
                  function(err) { console.log('Service Worker registration failed: ', err); }
                );
              });
            }
          `}
        </Script>
        
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-L8KTS5J96J" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L8KTS5J96J');
          `}
        </Script>

        {/* Yandex Metrika (SPA / SSR) */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=111018931", "ym");

            ym(111018931, "init", {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: "dataLayer",
                referrer: document.referrer,
                url: location.href,
                accurateTrackBounce: true,
                trackLinks: true
            });
          `}
        </Script>
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://mc.yandex.ru/watch/111018931" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}

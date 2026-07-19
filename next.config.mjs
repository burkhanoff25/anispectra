/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Постеры приходят с разных CDN сторонних API (AniLiberty, Kodik/Shikimori-зеркала,
    // MangaDex) — заранее перечислить все хосты невозможно, поэтому оптимизация
    // отключена и next/image используется как обычный <img>, без риска ошибки
    // "hostname is not configured" в проде.
    unoptimized: true
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;

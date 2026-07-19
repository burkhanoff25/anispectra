import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/profile",
    },
    sitemap: "https://anispectra-sigma.vercel.app/sitemap.xml",
  };
}

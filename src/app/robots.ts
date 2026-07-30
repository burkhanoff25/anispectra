import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/api/", "/auth/"],
    },
    sitemap: "https://anispectra.uz/sitemap.xml",
  };
}

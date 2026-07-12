import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/card/", "/privacy"],
        disallow: ["/api/", "/challenge/", "/internal/"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://haahaaland.app"}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://haahaaland.app";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/privacy`, changeFrequency: "monthly", priority: 0.4 },
  ];
}

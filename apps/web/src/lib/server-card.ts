import {
  ProductUrlSchema,
  ScoutCardSchema,
  type ScoutCard,
} from "@haahaaland/shared";
import { cardStore } from "./store";

export type PublicCardRecord = {
  id: string;
  slug: string;
  card: ScoutCard;
  createdAt: string;
  images?: { svgUrl: string; pngUrl: string; ogUrl: string };
};

export async function getServerCard(
  id: string,
): Promise<PublicCardRecord | null> {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) return null;
  const local = cardStore.get(id);
  if (local)
    return { id, slug: id, card: local.card, createdAt: local.createdAt };

  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!api || !secret) return null;
  try {
    const response = await fetch(
      `${api.replace(/\/$/, "")}/v1/cards/${encodeURIComponent(id)}`,
      {
        headers: { "x-haahaaland-proxy-secret": secret },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;
    const parsed = ScoutCardSchema.safeParse(data.card);
    if (!parsed.success) return null;
    const rawImages =
      typeof data.images === "object" && data.images !== null
        ? (data.images as Record<string, unknown>)
        : null;
    const svgUrl = ProductUrlSchema.safeParse(rawImages?.svgUrl);
    const pngUrl = ProductUrlSchema.safeParse(rawImages?.pngUrl);
    const ogUrl = ProductUrlSchema.safeParse(rawImages?.ogUrl);
    const images =
      svgUrl.success && pngUrl.success && ogUrl.success
        ? { svgUrl: svgUrl.data, pngUrl: pngUrl.data, ogUrl: ogUrl.data }
        : undefined;
    return {
      id,
      slug: typeof data.slug === "string" ? data.slug : id,
      card: parsed.data,
      createdAt:
        typeof data.createdAt === "string"
          ? data.createdAt
          : new Date(0).toISOString(),
      ...(images ? { images } : {}),
    };
  } catch {
    return null;
  }
}

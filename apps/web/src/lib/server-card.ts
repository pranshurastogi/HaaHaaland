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

const LOG_TAG = "[haahaaland:card-lookup]";

export async function getServerCard(
  id: string,
): Promise<PublicCardRecord | null> {
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
    console.warn(`${LOG_TAG} rejected malformed card id "${id}"`);
    return null;
  }
  const local = cardStore.get(id);
  if (local) {
    console.log(`${LOG_TAG} ${id} found in this worker's in-memory store`);
    return { id, slug: id, card: local.card, createdAt: local.createdAt };
  }

  const api = process.env.RAILWAY_API_URL;
  const secret = process.env.INTERNAL_PROXY_SECRET;
  if (!api || !secret) {
    console.warn(
      `${LOG_TAG} ${id} not in this isolate's memory and no RAILWAY_API_URL/INTERNAL_PROXY_SECRET configured to check the backend — ` +
        `this is expected to be intermittent: in-memory storage is NOT shared across Cloudflare Worker isolates/regions, ` +
        `so the same card id can 404 on one request and succeed on another`,
    );
    return null;
  }
  try {
    console.log(`${LOG_TAG} ${id} not in memory, checking backend at ${api}`);
    const response = await fetch(
      `${api.replace(/\/$/, "")}/v1/cards/${encodeURIComponent(id)}`,
      {
        headers: { "x-haahaaland-proxy-secret": secret },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.error(
        `${LOG_TAG} ${id} backend lookup failed with HTTP ${response.status}`,
      );
      return null;
    }
    const data = (await response.json()) as Record<string, unknown>;
    const parsed = ScoutCardSchema.safeParse(data.card);
    if (!parsed.success) {
      console.error(
        `${LOG_TAG} ${id} backend returned a card that failed schema validation: ${parsed.error.issues[0]?.message ?? "unknown validation error"}`,
      );
      return null;
    }
    console.log(`${LOG_TAG} ${id} found via backend`);
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
  } catch (error) {
    const timeout = error instanceof Error && error.name === "TimeoutError";
    console.error(
      `${LOG_TAG} ${id} backend lookup errored: ${
        timeout
          ? "request timed out after 8s"
          : error instanceof Error
            ? error.message
            : String(error)
      }`,
    );
    return null;
  }
}

import { renderScoutCardSvg } from "@haahaaland/shared";
import { getServerCard } from "@/lib/server-card";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await getServerCard(id);
  if (!found) return new Response("Card image not found", { status: 404 });
  const variant =
    new URL(request.url).searchParams.get("variant") === "og" ? "og" : "square";
  const domain = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
    : "haahaaland.app";
  const svg = renderScoutCardSvg(found.card, id, variant, domain);
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=31536000, immutable",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'",
      "x-content-type-options": "nosniff",
    },
  });
}

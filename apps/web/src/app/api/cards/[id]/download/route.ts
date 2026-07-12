import { NextResponse } from "next/server";
import { getServerCard } from "@/lib/server-card";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await getServerCard(id);
  if (!found?.images)
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Persistent PNG not found.",
          requestId: crypto.randomUUID(),
          retryable: false,
        },
      },
      { status: 404 },
    );
  try {
    const response = await fetch(found.images.pngUrl, {
      signal: AbortSignal.timeout(8_000),
      cache: "force-cache",
    });
    const length = Number(response.headers.get("content-length") ?? 0);
    if (
      !response.ok ||
      response.headers.get("content-type")?.split(";")[0] !== "image/png" ||
      length > 10_000_000
    )
      throw new Error("Invalid PNG object response");
    const body = await response.arrayBuffer();
    if (body.byteLength > 10_000_000)
      throw new Error("PNG object exceeded size limit");
    return new NextResponse(body, {
      headers: {
        "content-type": "image/png",
        "content-disposition": `attachment; filename="haahaaland-${id.slice(0, 12)}.png"`,
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Persistent PNG is temporarily unavailable.",
          requestId: crypto.randomUUID(),
          retryable: true,
        },
      },
      { status: 502 },
    );
  }
}

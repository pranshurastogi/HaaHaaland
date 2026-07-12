import { NextResponse } from "next/server";
import { getServerCard } from "@/lib/server-card";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await getServerCard(id);
  return found
    ? NextResponse.json(found, {
        headers: { "cache-control": "private, no-store" },
      })
    : NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Scout card not found.",
            requestId: crypto.randomUUID(),
            retryable: false,
          },
        },
        { status: 404 },
      );
}

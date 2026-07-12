import { NextResponse } from "next/server";
import { cardStore } from "@/lib/store";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = cardStore.get(id);
  return found
    ? NextResponse.json({ id, ...found })
    : NextResponse.json({ error: "not_found" }, { status: 404 });
}

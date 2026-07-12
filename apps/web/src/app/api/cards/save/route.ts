import { NextResponse } from "next/server";
import { SaveCardSchema } from "@haahaaland/shared";
import { cardStore } from "@/lib/store";
export async function POST(request: Request) {
  const parsed = SaveCardSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const found = cardStore.get(parsed.data.cardId);
  if (!found) return NextResponse.json({ error: "not_found" }, { status: 404 });
  found.email = parsed.data.email.toLowerCase();
  return NextResponse.json({ saved: true });
}

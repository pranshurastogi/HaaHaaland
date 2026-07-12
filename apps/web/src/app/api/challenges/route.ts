import { NextResponse } from "next/server";
import { ChallengeSchema } from "@haahaaland/shared";
import { cardStore, challengeStore } from "@/lib/store";
export async function POST(request: Request) {
  const parsed = ChallengeSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success || !cardStore.has(parsed.data.cardId))
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const code = crypto.randomUUID().slice(0, 8);
  challengeStore.set(code, parsed.data.cardId);
  return NextResponse.json(
    { code, url: `/challenge/${code}` },
    { status: 201 },
  );
}

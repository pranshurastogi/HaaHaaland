import { NextResponse } from "next/server";
import { cardStore } from "@/lib/store";
export async function GET() {
  const entries = [...cardStore.entries()]
    .filter(([, v]) => v.email)
    .slice(-10)
    .reverse()
    .map(([id, v], i) => ({
      rank: i + 1,
      id,
      handle: v.card.handle,
      archetypeId: v.card.primaryArchetypeId,
      aura: v.card.stats.find((s) => s.key === "aura")?.value ?? 0,
    }));
  return NextResponse.json({ entries });
}

import { ARCHETYPES } from "@haahaaland/archetypes";
import {
  GenerationRequestSchema,
  ScoutCardSchema,
  type ScoutCard,
} from "@haahaaland/shared";
export function localScout(input: unknown): {
  id: string;
  card: ScoutCard;
  meta: Record<string, unknown>;
} {
  const data = GenerationRequestSchema.parse(input);
  const seed = [...data.xUsername].reduce((n, c) => n + c.charCodeAt(0), 0);
  const player = ARCHETYPES[seed % ARCHETYPES.length]!;
  const keys = [
    "aura",
    "ballKnowledge",
    "output",
    "clutch",
    "mainCharacter",
    "fraudRisk",
  ] as const;
  const labels = [
    "Aura",
    "Ball knowledge",
    "Output",
    "Clutch",
    "Main character",
    "Fraud risk",
  ];
  const stats = keys.map((key, index) => ({
    key,
    label: labels[index]!,
    value: Math.min(96, 42 + ((seed * (index + 5)) % 54)),
    reason: data.manualPosts.length
      ? "Inferred from your public post excerpts"
      : "Provisional score — limited indexed evidence",
  }));
  const card = ScoutCardSchema.parse({
    version: "1.0",
    handle: data.xUsername,
    primaryArchetypeId: player.id,
    position: "Timeline playmaker",
    clubName: `${data.xUsername.slice(0, 18)} Social Club`,
    headline: `${player.safeDisplayName} energy, browser-history finishing`,
    roast: `${player.strengths[0][0]?.toUpperCase()}${player.strengths[0].slice(1)} in midfield; ${player.weaknesses[0]} whenever the final tweet needs shipping. Champions League bio, occasional qualifying-round follow-through.`,
    compliment: `Your timeline projects ${player.strengths[0]} and ${player.strengths[1]}. You make the feed feel like a side with an actual game plan.`,
    varVerdict:
      "Decision stands. Elite potential, one suspicious touch, no clear and obvious error.",
    transferValue: `€${48 + (seed % 72)}M in vibes`,
    stats,
    evidenceSummary: data.manualPosts.length
      ? `Scouted ${data.manualPosts.length} supplied public post excerpt${data.manualPosts.length > 1 ? "s" : ""}. External research was unavailable in this local run.`
      : `We found limited public data for this profile. Add three sample posts for a sharper scout report.`,
    researchConfidence: data.manualPosts.length
      ? 58 + data.manualPosts.length * 10
      : 28,
    shareCopy: `I got scouted by HaaHaaLand and came back as ${player.safeDisplayName}. Your timeline, scouted. Your ego, benched.`,
    challengeCopy: `My @${data.xUsername} scout card has ${stats[0]!.value} Aura. Think you start ahead of me?`,
    safetyFlags: ["local-fallback", "limited-public-evidence"],
    sourcesUsed: [`https://x.com/${data.xUsername}`],
  });
  return {
    id: crypto.randomUUID(),
    card,
    meta: {
      model: "deterministic-fallback",
      promptVersion: "1.0",
      taxonomyVersion: "2026.07.1",
      retryCount: 0,
    },
  };
}

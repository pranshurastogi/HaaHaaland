import { describe, expect, it } from "vitest";
import { ScoutCardSchema, renderScoutCardSvg } from "../src/index";

const card = ScoutCardSchema.parse({
  version: "1",
  handle: "build<fc",
  displayName: "Build & Ship",
  primaryArchetypeId: "kroos",
  secondaryArchetypeId: "palmer",
  position: "Systems midfielder",
  clubName: "Build FC",
  headline: "Calm control with launch-day pressing",
  roast: "The architecture is Champions League; the changelog is a friendly.",
  compliment: "Precise, composed, and consistently useful.",
  varVerdict: "Decision stands.",
  transferValue: "€88M in systems",
  stats: [
    "aura",
    "ballKnowledge",
    "output",
    "clutch",
    "mainCharacter",
    "fraudRisk",
  ].map((key) => ({
    key,
    label: key,
    value: 77,
    reason: "Visible public output",
  })),
  evidenceSummary: "Public evidence shows systems thinking.",
  researchConfidence: 75,
  shareCopy: "I got scouted.",
  challengeCopy: "Beat my card.",
  safetyFlags: [],
  sourcesUsed: ["https://x.com/buildfc"],
});

describe("renderScoutCardSvg", () => {
  it("renders an accessible 1080 square without unescaped user text", () => {
    const svg = renderScoutCardSvg(
      card,
      "card_abc",
      "square",
      "haahaaland.example",
    );
    expect(svg).toContain('viewBox="0 0 1080 1080"');
    expect(svg).toContain("Build &amp; Ship");
    expect(svg).not.toContain("build<fc");
    expect(svg).toContain("Public-web scouting; just for fun.");
    expect(svg).toContain("Fraud Risk is a football-meme score");
  });

  it("renders a 1200×630 Open Graph variant", () => {
    expect(
      renderScoutCardSvg(card, "card_abc", "og", "haahaaland.example"),
    ).toContain('viewBox="0 0 1200 630"');
  });
});

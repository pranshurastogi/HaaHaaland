import { describe, expect, it } from "vitest";
import {
  ScoutCardSchema,
  normalizeXHandle,
  ProductUrlSchema,
} from "../src/index";

describe("normalizeXHandle", () => {
  it.each([
    ["@ColdPalmer", "coldpalmer"],
    ["https://x.com/KDB17", "kdb17"],
    ["Messi", "messi"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeXHandle(input)).toBe(expected);
  });
  it.each([
    "",
    "has space",
    "https://evil.example/user",
    "../ronaldo",
    "name?admin=true",
    "a".repeat(16),
  ])("rejects unsafe handle %s", (input) => {
    expect(() => normalizeXHandle(input)).toThrow();
  });
});

describe("ProductUrlSchema", () => {
  it("allows normal https URLs", () =>
    expect(ProductUrlSchema.parse("https://example.com/product")).toBe(
      "https://example.com/product",
    ));
  it.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://169.254.169.254/latest",
    "http://user:pass@example.com",
    "ftp://example.com",
    "https://service.railway.internal",
  ])("blocks SSRF target %s", (url) =>
    expect(() => ProductUrlSchema.parse(url)).toThrow(),
  );
});

describe("ScoutCardSchema", () => {
  const base = {
    version: "1",
    handle: "tester",
    primaryArchetypeId: "haaland",
    position: "Timeline striker",
    clubName: "Reply FC",
    headline: "Relentless output",
    roast: "Fast enough to publish before reading.",
    compliment: "Ships consistently.",
    varVerdict: "Decision stands.",
    transferValue: "€99M in vibes",
    stats: [
      "aura",
      "ballKnowledge",
      "output",
      "clutch",
      "mainCharacter",
      "fraudRisk",
    ].map((key) => ({ key, label: key, value: 80, reason: "Public evidence" })),
    evidenceSummary: "Public posts show consistent building.",
    researchConfidence: 72,
    shareCopy: "I got scouted.",
    challengeCopy: "Beat my score.",
    safetyFlags: [],
    sourcesUsed: ["https://x.com/tester"],
  };
  it("accepts all six unique stats", () =>
    expect(ScoutCardSchema.parse(base).handle).toBe("tester"));
  it("rejects duplicate stat keys", () =>
    expect(() =>
      ScoutCardSchema.parse({
        ...base,
        stats: base.stats.map((s) => ({ ...s, key: "aura" })),
      }),
    ).toThrow());
  it("rejects unknown archetypes", () =>
    expect(() =>
      ScoutCardSchema.parse({ ...base, primaryArchetypeId: "invented" }),
    ).toThrow());
});

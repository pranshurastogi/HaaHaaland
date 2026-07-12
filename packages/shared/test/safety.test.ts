import { describe, expect, it } from "vitest";
import {
  ApiErrorSchema,
  EVENT_NAMES,
  FEATURE_DEFAULTS,
  PublicHttpUrlSchema,
  ScoutCardSchema,
  enforceCardSafety,
  normalizeEmail,
  normalizeInstagramHandle,
  sanitizeEvidence,
} from "../src/index";

const safeCard = ScoutCardSchema.parse({
  version: "1",
  handle: "tester",
  primaryArchetypeId: "haaland",
  secondaryArchetypeId: "kroos",
  position: "Timeline striker",
  clubName: "Reply FC",
  headline: "Relentless public output",
  roast: "Ships quickly and occasionally skips the final pass.",
  compliment: "Consistent, direct, and useful.",
  varVerdict: "Decision stands.",
  transferValue: "€99M in vibes",
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
    value: 80,
    reason: "Visible public output",
  })),
  evidenceSummary: "Public posts focus on product execution.",
  researchConfidence: 72,
  shareCopy: "I got scouted.",
  challengeCopy: "Beat my score.",
  safetyFlags: [],
  sourcesUsed: ["https://x.com/tester"],
});

describe("identity normalization", () => {
  it.each([
    ["@Creator.Name", "creator.name"],
    [" Creator_Name ", "creator_name"],
  ])("normalizes Instagram handle %s", (input, expected) => {
    expect(normalizeInstagramHandle(input)).toBe(expected);
  });

  it.each(["bad space", "../name", "a".repeat(31)])(
    "rejects unsafe Instagram handle %s",
    (input) => expect(() => normalizeInstagramHandle(input)).toThrow(),
  );

  it("normalizes email without changing provider semantics", () => {
    expect(normalizeEmail("  Scout@Example.COM ")).toBe("scout@example.com");
  });
});

describe("public source URLs", () => {
  it("accepts only HTTP(S)", () => {
    expect(PublicHttpUrlSchema.parse("https://example.com/profile")).toBe(
      "https://example.com/profile",
    );
    expect(() => PublicHttpUrlSchema.parse("ftp://example.com/file")).toThrow();
  });
});

describe("deterministic safety", () => {
  it("drops evidence containing sensitive traits", () => {
    expect(
      sanitizeEvidence([
        "Public posts focus on product launches.",
        "The profile discusses a private medical diagnosis.",
        "Visible football opinions favour a high press.",
      ]),
    ).toEqual([
      "Public posts focus on product launches.",
      "Visible football opinions favour a high press.",
    ]);
  });

  it("replaces prohibited allegations and downgrades intensity", () => {
    const result = enforceCardSafety(
      { ...safeCard, roast: "This person commits fraud and criminal abuse." },
      "red-card",
    );
    expect(result.intensity).toBe("friendly");
    expect(result.card.roast).toContain("public posting style");
    expect(result.card.roast).not.toMatch(/fraud|criminal|abuse/i);
    expect(result.card.safetyFlags).toContain("deterministic-safety-rewrite");
  });

  it("rewrites prohibited text in every generated display surface", () => {
    const result = enforceCardSafety(
      {
        ...safeCard,
        displayName: "A criminal mastermind",
        shareCopy: "Share this scammer report",
        stats: safeCard.stats.map((stat, index) =>
          index === 0
            ? { ...stat, reason: "A hidden medical diagnosis" }
            : stat,
        ),
      },
      "derby",
    );
    const rendered = JSON.stringify(result.card);
    expect(rendered).not.toMatch(/criminal|scammer|medical diagnosis/i);
    expect(result.card.displayName).toBeUndefined();
    expect(result.card.safetyFlags).toContain("deterministic-safety-rewrite");
  });

  it("keeps the football-meme Fraud Risk stat when safely explained", () => {
    const result = enforceCardSafety(safeCard, "derby");
    expect(
      result.card.stats.find((stat) => stat.key === "fraudRisk")?.value,
    ).toBe(80);
    expect(result.intensity).toBe("derby");
  });

  it("downgrades sparse-research red-card output", () => {
    const result = enforceCardSafety(
      { ...safeCard, researchConfidence: 25 },
      "red-card",
    );
    expect(result.intensity).toBe("friendly");
    expect(result.card.safetyFlags).toContain("intensity-downgraded");
  });
});

describe("shared contracts", () => {
  it("validates consistent safe API errors", () => {
    expect(
      ApiErrorSchema.parse({
        error: {
          code: "INVALID_INPUT",
          message: "Enter a valid X username.",
          requestId: "req_123",
          retryable: false,
        },
      }).error.code,
    ).toBe("INVALID_INPUT");
  });

  it("exposes canonical analytics names and safe feature defaults", () => {
    expect(EVENT_NAMES).toContain("activation_completed");
    expect(FEATURE_DEFAULTS.FEATURE_PROFILE_SCOUT).toBe(true);
    expect(FEATURE_DEFAULTS.FEATURE_PAYMENTS).toBe(false);
  });
});

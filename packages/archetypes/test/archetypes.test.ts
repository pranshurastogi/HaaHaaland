import { describe, expect, it } from "vitest";
import { ARCHETYPES, ARCHETYPE_IDS, getArchetype } from "../src/index";

describe("curated archetypes", () => {
  it("contains 24 to 36 unique versioned entries", () => {
    expect(ARCHETYPES.length).toBeGreaterThanOrEqual(24);
    expect(ARCHETYPES.length).toBeLessThanOrEqual(36);
    expect(new Set(ARCHETYPE_IDS).size).toBe(ARCHETYPES.length);
  });
  it("keeps every entry non-defamatory and complete", () => {
    for (const entry of ARCHETYPES) {
      expect(entry.roastTemplates.length).toBeGreaterThan(0);
      expect(entry.complimentTemplates.length).toBeGreaterThan(0);
      expect(entry.traits.length).toBeGreaterThan(1);
    }
  });
  it("looks up an archetype", () =>
    expect(getArchetype("haaland").playerName).toBe("Erling Haaland"));
});

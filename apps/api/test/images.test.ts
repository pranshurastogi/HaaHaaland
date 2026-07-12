import { describe, expect, it } from "vitest";
import type { ScoutCard } from "@haahaaland/shared";
import { renderCardImageAssets } from "../src/images";

const card = {
  version: "1",
  handle: "imagefc",
  displayName: "Image FC",
  primaryArchetypeId: "haaland",
  secondaryArchetypeId: "kroos",
  position: "Timeline Striker",
  clubName: "Public Web FC",
  headline: "A verified image fixture",
  roast: "Plenty of output with one or two passes still finding row Z.",
  compliment: "Direct, useful, and composed under pressure.",
  stats: [
    ["aura", "Aura", 88],
    ["ballKnowledge", "Ball Knowledge", 76],
    ["output", "Output", 91],
    ["clutch", "Clutch", 84],
    ["mainCharacter", "Main Character", 73],
    ["fraudRisk", "Fraud Risk", 24],
  ].map(([key, label, value]) => ({ key, label, value })),
} as unknown as ScoutCard;

const dimensions = (png: Uint8Array) => {
  const view = Buffer.from(png);
  return { width: view.readUInt32BE(16), height: view.readUInt32BE(20) };
};

describe("server card image rendering", () => {
  it("renders exact square and OG PNG dimensions", () => {
    const assets = renderCardImageAssets("card-image-123", card);
    expect(assets.squareSvg).toContain('width="1080" height="1080"');
    expect(dimensions(assets.squarePng)).toEqual({ width: 1080, height: 1080 });
    expect(dimensions(assets.ogPng)).toEqual({ width: 1200, height: 630 });
  });

  it("rejects unsafe object keys", () => {
    expect(() => renderCardImageAssets("../escape", card)).toThrow(
      "Invalid card image key",
    );
  });
});

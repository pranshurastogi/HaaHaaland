import type { ScoutCard } from "@haahaaland/shared";
type Stored = { card: ScoutCard; createdAt: string; email?: string };
const globalStore = globalThis as typeof globalThis & {
  __haahaalandCards?: Map<string, Stored>;
  __haahaalandChallenges?: Map<string, string>;
};
export const cardStore = (globalStore.__haahaalandCards ??= new Map());
export const challengeStore = (globalStore.__haahaalandChallenges ??=
  new Map());

import type { ScoutCard } from "@haahaaland/shared";

type Stored = {
  card: ScoutCard;
  createdAt: string;
  managementTokenHash: string;
  sessionHash: string;
  email?: string;
};
export type StoredChallenge = {
  cardId: string;
  challengerSessionHash: string;
  targetHandle?: string;
  acceptedCardId?: string;
  acceptedSessionId?: string;
  result?: { winnerCardId: string; verdict: string };
  credited: boolean;
  createdAt: string;
  completedAt?: string;
};
const globalStore = globalThis as typeof globalThis & {
  __haahaalandCards?: Map<string, Stored>;
  __haahaalandChallenges?: Map<string, StoredChallenge>;
};
export const cardStore = (globalStore.__haahaalandCards ??= new Map());
export const challengeStore = (globalStore.__haahaalandChallenges ??=
  new Map());

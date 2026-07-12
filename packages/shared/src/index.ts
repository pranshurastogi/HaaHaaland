import { z } from "zod";

export const ARCHETYPE_IDS = [
  "haaland",
  "messi",
  "ronaldo",
  "bellingham",
  "palmer",
  "de-bruyne",
  "kante",
  "neymar",
  "nunez",
  "maguire",
  "antony",
  "rudiger",
  "kroos",
  "salah",
  "saka",
  "modric",
  "rodri",
  "vinicius",
  "griezmann",
  "son",
  "martinez",
  "van-dijk",
  "mbappe",
  "mourinho",
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];
export const IntensitySchema = z.enum(["friendly", "derby", "red-card"]);
export type RoastIntensity = z.infer<typeof IntensitySchema>;

export function normalizeXHandle(value: string): string {
  let candidate = value.trim();
  if (/^https?:\/\//i.test(candidate)) {
    const url = new URL(candidate);
    if (
      !["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(
        url.hostname.toLowerCase(),
      ) ||
      url.search ||
      url.hash
    )
      throw new Error("Enter an X profile URL");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) throw new Error("Enter an X profile URL");
    candidate = parts[0] ?? "";
  }
  candidate = candidate.replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(candidate))
    throw new Error("Enter a valid X username");
  return candidate.toLowerCase();
}

export const XHandleSchema = z.string().transform((value, ctx) => {
  try {
    return normalizeXHandle(value);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid X username",
    });
    return z.NEVER;
  }
});
export const InstagramHandleSchema = z
  .string()
  .trim()
  .max(30)
  .regex(/^[A-Za-z0-9._]+$/)
  .optional()
  .or(z.literal(""));
export const ManualPostsSchema = z
  .array(z.string().trim().min(1).max(500))
  .max(3)
  .default([])
  .refine(
    (posts) => posts.join("").length <= 1200,
    "Post excerpts are too long",
  );

const blockedHost = (host: string) => {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local") ||
    h.endsWith(".internal") ||
    h.endsWith(".railway.internal")
  )
    return true;
  if (h === "::1" || h === "0.0.0.0") return true;
  const p = h.split(".").map(Number);
  if (p.length === 4 && p.every(Number.isInteger))
    return (
      p[0] === 10 ||
      p[0] === 127 ||
      p[0] === 0 ||
      (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && (p[1] ?? 0) >= 16 && (p[1] ?? 0) <= 31) ||
      (p[0] === 192 && p[1] === 168) ||
      (p[0] === 100 && (p[1] ?? 0) >= 64 && (p[1] ?? 0) <= 127)
    );
  return false;
};
export const ProductUrlSchema = z
  .string()
  .url()
  .transform((value, ctx) => {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      blockedHost(url.hostname) ||
      (url.port && !["80", "443"].includes(url.port))
    ) {
      ctx.addIssue({ code: "custom", message: "URL is not permitted" });
      return z.NEVER;
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  });

export const GenerationRequestSchema = z.object({
  xUsername: z
    .string()
    .min(1)
    .transform((v, ctx) => {
      try {
        return normalizeXHandle(v);
      } catch {
        ctx.addIssue({ code: "custom", message: "Enter a valid X username" });
        return z.NEVER;
      }
    }),
  instagramUsername: InstagramHandleSchema,
  manualPosts: ManualPostsSchema,
  intensity: IntensitySchema.default("derby"),
  referralCode: z.string().max(64).optional(),
});
const StatKeySchema = z.enum([
  "aura",
  "ballKnowledge",
  "output",
  "clutch",
  "mainCharacter",
  "fraudRisk",
]);
export const ScoutStatSchema = z.object({
  key: StatKeySchema,
  label: z.string().max(40),
  value: z.number().int().min(1).max(99),
  reason: z.string().max(180),
});
export const ScoutCardSchema = z.object({
  version: z.string(),
  handle: z.string(),
  displayName: z.string().optional(),
  primaryArchetypeId: z.enum(ARCHETYPE_IDS),
  secondaryArchetypeId: z.enum(ARCHETYPE_IDS).optional(),
  position: z.string().max(40),
  clubName: z.string().max(50),
  headline: z.string().max(110),
  roast: z.string().max(300),
  compliment: z.string().max(240),
  varVerdict: z.string().max(220),
  transferValue: z.string().max(40),
  stats: z
    .array(ScoutStatSchema)
    .length(6)
    .superRefine((stats, ctx) => {
      if (new Set(stats.map((s) => s.key)).size !== 6)
        ctx.addIssue({
          code: "custom",
          message: "All stat keys must be unique",
        });
    }),
  evidenceSummary: z.string().max(400),
  researchConfidence: z.number().min(0).max(100),
  shareCopy: z.string().max(260),
  challengeCopy: z.string().max(260),
  safetyFlags: z.array(z.string()),
  sourcesUsed: z.array(z.string().url()).max(10),
});
export type ScoutCard = z.infer<typeof ScoutCardSchema>;
export const SaveCardSchema = z.object({
  cardId: z.string().min(1).max(80),
  email: z.string().email().max(254),
});
export const ChallengeSchema = z.object({
  cardId: z.string().min(1).max(80),
  friendHandle: z.string().max(15).optional(),
});

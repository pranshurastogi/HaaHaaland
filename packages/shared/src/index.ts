import { z } from "zod";
export { renderScoutCardSvg, type CardImageVariant } from "./card-render";

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

export function normalizeInstagramHandle(value: string): string {
  let candidate = value.trim();
  if (/^https?:\/\//i.test(candidate)) {
    const url = new URL(candidate);
    if (
      !["instagram.com", "www.instagram.com"].includes(
        url.hostname.toLowerCase(),
      ) ||
      url.search ||
      url.hash
    )
      throw new Error("Enter an Instagram profile URL");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length !== 1) throw new Error("Enter an Instagram profile URL");
    candidate = parts[0] ?? "";
  }
  candidate = candidate.replace(/^@/, "");
  if (!/^[A-Za-z0-9._]{1,30}$/.test(candidate))
    throw new Error("Enter a valid Instagram username");
  return candidate.toLowerCase();
}

export function normalizeEmail(value: string): string {
  return z.string().trim().email().max(254).parse(value).toLowerCase();
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
  .transform((value, ctx) => {
    if (!value.trim()) return "";
    try {
      return normalizeInstagramHandle(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error ? error.message : "Invalid Instagram username",
      });
      return z.NEVER;
    }
  })
  .optional();
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
export const PublicHttpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Source URLs must use HTTP or HTTPS");

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
  sessionId: z.string().uuid(),
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
  sourcesUsed: z.array(PublicHttpUrlSchema).max(10),
});
export type ScoutCard = z.infer<typeof ScoutCardSchema>;

export const API_ERROR_CODES = [
  "INVALID_INPUT",
  "RATE_LIMITED",
  "RESEARCH_NOT_FOUND",
  "RESEARCH_TIMEOUT",
  "MODEL_TIMEOUT",
  "MODEL_INVALID_OUTPUT",
  "SAFETY_REJECTED",
  "IMAGE_RENDER_FAILED",
  "STORAGE_FAILED",
  "HERMES_UNAVAILABLE",
  "CONVEX_UNAVAILABLE",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "INTERNAL_ERROR",
] as const;
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.enum(API_ERROR_CODES),
    message: z.string().max(240),
    requestId: z.string().min(1).max(100),
    retryable: z.boolean(),
  }),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const EVENT_NAMES = [
  "landing_view",
  "example_card_view",
  "username_input_started",
  "username_submitted",
  "research_started",
  "research_cache_hit",
  "research_completed",
  "research_low_confidence",
  "research_failed",
  "generation_started",
  "generation_completed",
  "generation_failed",
  "result_viewed",
  "email_prompt_viewed",
  "email_saved",
  "activation_completed",
  "download_clicked",
  "share_x_clicked",
  "share_whatsapp_clicked",
  "copy_link_clicked",
  "challenge_created",
  "challenge_landed",
  "challenge_accepted",
  "referral_landed",
  "referral_generation_completed",
  "referral_credited",
  "var_review_started",
  "var_review_completed",
  "audio_started",
  "audio_completed",
  "product_mode_started",
  "product_mode_completed",
  "checkout_started",
  "checkout_completed",
] as const;
export type AnalyticsEventName = (typeof EVENT_NAMES)[number];

export const FEATURE_DEFAULTS = {
  FEATURE_PROFILE_SCOUT: true,
  FEATURE_INSTAGRAM_INPUT: true,
  FEATURE_MANUAL_POSTS: true,
  FEATURE_CHALLENGES: true,
  FEATURE_LEADERBOARD: true,
  FEATURE_PRODUCT_XI: false,
  FEATURE_AUDIO: false,
  FEATURE_HERMES_VAR: false,
  FEATURE_PAYMENTS: false,
} as const;

const SENSITIVE_EVIDENCE_PATTERN =
  /\b(race|racial|caste|religion|religious|gender identity|transgender|sexual orientation|gay|lesbian|bisexual|disability|disabled|medical|diagnos(?:is|ed)|mental health|pregnan(?:t|cy)|children?|family|private relationship|financial hardship|nationality|ethnicity|genetic|veteran|immigration status|political affiliation|substance abuse|addiction)\b/i;
const PROHIBITED_CLAIM_PATTERN =
  /\b(fraud(?:ulent)?|scam(?:mer|ming)?|criminal(?:ity)?|illegal|corrupt(?:ion)?|brib(?:e|ery)|harass(?:ment|ed|ing)?|abus(?:e|ed|ive)|violent|terroris(?:t|m)|extremis(?:t|m)|murder(?:er)?|rap(?:e|ist)|pedo(?:phile)?|racist|sexist|psychopath|sociopath|mentally ill|medical diagnosis|hidden political affiliation|private conduct|substance abuse|drug addict|alcoholic|bankrupt(?:cy)?|financial debt)\b/i;

export function sanitizeEvidence(evidence: readonly string[]): string[] {
  return evidence
    .map((item) =>
      [...item]
        .map((character) => {
          const code = character.charCodeAt(0);
          return code < 32 || code === 127 ? " " : character;
        })
        .join("")
        .trim(),
    )
    .filter(
      (item) =>
        item.length > 0 &&
        item.length <= 500 &&
        !SENSITIVE_EVIDENCE_PATTERN.test(item) &&
        !PROHIBITED_CLAIM_PATTERN.test(item),
    )
    .slice(0, 10);
}

export function enforceCardSafety(
  input: ScoutCard,
  requestedIntensity: RoastIntensity,
): { card: ScoutCard; intensity: RoastIntensity } {
  const unsafe = (value: string | undefined) =>
    Boolean(
      value &&
      (SENSITIVE_EVIDENCE_PATTERN.test(value) ||
        PROHIBITED_CLAIM_PATTERN.test(value)),
    );
  const unsafeText = [
    input.displayName,
    input.position,
    input.clubName,
    input.headline,
    input.roast,
    input.compliment,
    input.varVerdict,
    input.transferValue,
    input.evidenceSummary,
    input.shareCopy,
    input.challengeCopy,
    ...input.stats.flatMap((stat) => [stat.label, stat.reason]),
  ].some(unsafe);
  const sparse = input.researchConfidence < 40;
  const flags = new Set(input.safetyFlags);
  let intensity = requestedIntensity;
  const safe = { ...input };
  if (unsafeText) {
    if (unsafe(safe.displayName)) delete safe.displayName;
    safe.position = unsafe(safe.position)
      ? "Attacking Midfielder"
      : safe.position;
    safe.clubName = unsafe(safe.clubName)
      ? "Public Timeline FC"
      : safe.clubName;
    safe.transferValue = unsafe(safe.transferValue)
      ? "Undisclosed — scout's decision"
      : safe.transferValue;
    safe.headline = "Big-match energy with room for a cleaner final pass";
    safe.roast =
      "Your public posting style brings plenty of confidence; the visible follow-through occasionally arrives after the final whistle.";
    safe.compliment =
      "Your public work shows ambition, recognizable interests, and the courage to keep shipping.";
    safe.varVerdict =
      "Decision softened: only public posting and visible product signals were considered.";
    safe.evidenceSummary =
      "The scout used only non-sensitive public posting and professional signals.";
    safe.shareCopy =
      "My public timeline just received a playful football scout report. Scout yours.";
    safe.challengeCopy =
      "Think your public timeline has more aura? Accept this HaaHaaLand challenge.";
    safe.stats = safe.stats.map((stat) => ({
      ...stat,
      label: unsafe(stat.label) ? stat.key : stat.label,
      reason: unsafe(stat.reason)
        ? "Score based only on non-sensitive public posting signals."
        : stat.reason,
    }));
    flags.add("deterministic-safety-rewrite");
    intensity = "friendly";
  }
  if (sparse && intensity !== "friendly") {
    intensity = "friendly";
    flags.add("intensity-downgraded");
  }
  safe.stats = safe.stats.map((stat) =>
    stat.key === "fraudRisk"
      ? {
          ...stat,
          label: "Fraud Risk*",
          reason:
            "Football-meme score for online hype versus visible public output; never an allegation.",
        }
      : stat,
  );
  safe.safetyFlags = [...flags];
  return { card: ScoutCardSchema.parse(safe), intensity };
}

const ManagementTokenSchema = z
  .string()
  .min(32)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

export const SaveCardSchema = z.object({
  cardId: z.string().min(1).max(80),
  managementToken: ManagementTokenSchema,
  email: z.string().transform((value, ctx) => {
    try {
      return normalizeEmail(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "Enter a valid email address" });
      return z.NEVER;
    }
  }),
});
export const ChallengeSchema = z.object({
  cardId: z.string().min(1).max(80),
  managementToken: ManagementTokenSchema,
  sessionId: z.string().uuid(),
  friendHandle: z
    .string()
    .max(15)
    .transform((value, ctx) => {
      try {
        return normalizeXHandle(value);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid friend handle",
        });
        return z.NEVER;
      }
    })
    .optional(),
});
export const ChallengeAcceptSchema = z.object({
  acceptedCardId: z.string().min(1).max(80),
  managementToken: ManagementTokenSchema,
  sessionId: z.string().uuid(),
});
export const ShareEventSchema = z.object({
  channel: z.enum(["x", "whatsapp", "copy", "download"]),
  sessionId: z.string().uuid(),
});

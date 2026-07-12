export type PlayerArchetype = {
  id: string;
  playerName: string;
  safeDisplayName: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  suitableSignals: string[];
  unsuitableSignals: string[];
  roastTemplates: string[];
  complimentTemplates: string[];
  positionProfile: string[];
  intensityRange: ["friendly", "derby", "red-card"];
};
export const TAXONOMY_VERSION = "2026.07.1";
export const ARCHETYPES = [
  {
    id: "haaland",
    playerName: "Erling Haaland",
    safeDisplayName: "Erling Haaland",
    traits: ["relentless", "direct"],
    strengths: ["high output", "decisive execution"],
    weaknesses: ["subtlety", "build-up patience"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "High output with occasional subtlety in the final third.",
    ],
    complimentTemplates: [
      "Your timeline shows high output and decisive execution.",
    ],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "messi",
    playerName: "Lionel Messi",
    safeDisplayName: "Lionel Messi",
    traits: ["creative", "understated"],
    strengths: ["vision", "efficiency"],
    weaknesses: ["self-promotion", "defensive admin"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Vision with occasional self-promotion in the final third.",
    ],
    complimentTemplates: ["Your timeline shows vision and efficiency."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "ronaldo",
    playerName: "Cristiano Ronaldo",
    safeDisplayName: "Cristiano Ronaldo",
    traits: ["ambitious", "disciplined"],
    strengths: ["consistency", "presence"],
    weaknesses: ["delegation", "quiet launches"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Consistency with occasional delegation in the final third.",
    ],
    complimentTemplates: ["Your timeline shows consistency and presence."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "bellingham",
    playerName: "Jude Bellingham",
    safeDisplayName: "Jude Bellingham",
    traits: ["clutch", "commanding"],
    strengths: ["leadership", "big moments"],
    weaknesses: ["main-character restraint", "low-key updates"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Leadership with occasional main-character restraint in the final third.",
    ],
    complimentTemplates: ["Your timeline shows leadership and big moments."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "palmer",
    playerName: "Cole Palmer",
    safeDisplayName: "Cole Palmer",
    traits: ["calm", "dry"],
    strengths: ["pressure resistance", "timing"],
    weaknesses: ["visible urgency", "warm small talk"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Pressure resistance with occasional visible urgency in the final third.",
    ],
    complimentTemplates: [
      "Your timeline shows pressure resistance and timing.",
    ],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "de-bruyne",
    playerName: "Kevin De Bruyne",
    safeDisplayName: "Kevin De Bruyne",
    traits: ["precise", "technical"],
    strengths: ["high-signal delivery", "range"],
    weaknesses: ["presentation polish", "patience for noise"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "High-signal delivery with occasional presentation polish in the final third.",
    ],
    complimentTemplates: [
      "Your timeline shows high-signal delivery and range.",
    ],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "kante",
    playerName: "N’Golo Kanté",
    safeDisplayName: "N’Golo Kanté",
    traits: ["dependable", "humble"],
    strengths: ["usefulness", "coverage"],
    weaknesses: ["self-marketing", "taking credit"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Usefulness with occasional self-marketing in the final third.",
    ],
    complimentTemplates: ["Your timeline shows usefulness and coverage."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "neymar",
    playerName: "Neymar Jr.",
    safeDisplayName: "Neymar Jr.",
    traits: ["flair", "entertaining"],
    strengths: ["creativity", "attention"],
    weaknesses: ["consistency", "simple execution"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Creativity with occasional consistency in the final third.",
    ],
    complimentTemplates: ["Your timeline shows creativity and attention."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "nunez",
    playerName: "Darwin Núñez",
    safeDisplayName: "Darwin Núñez",
    traits: ["chaotic", "energetic"],
    strengths: ["volume", "unpredictability"],
    weaknesses: ["precision", "calm finishes"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: ["Volume with occasional precision in the final third."],
    complimentTemplates: ["Your timeline shows volume and unpredictability."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "maguire",
    playerName: "Harry Maguire",
    safeDisplayName: "Harry Maguire",
    traits: ["resilient", "visible"],
    strengths: ["recovery", "persistence"],
    weaknesses: ["meme avoidance", "turning radius"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Recovery with occasional meme avoidance in the final third.",
    ],
    complimentTemplates: ["Your timeline shows recovery and persistence."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "antony",
    playerName: "Antony",
    safeDisplayName: "Antony",
    traits: ["confident", "expressive"],
    strengths: ["belief", "commitment"],
    weaknesses: ["measured claims", "output-to-aura ratio"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Belief with occasional measured claims in the final third.",
    ],
    complimentTemplates: ["Your timeline shows belief and commitment."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "rudiger",
    playerName: "Antonio Rüdiger",
    safeDisplayName: "Antonio Rüdiger",
    traits: ["intense", "confrontational"],
    strengths: ["pressure", "effectiveness"],
    weaknesses: ["calm threads", "quiet disagreement"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Pressure with occasional calm threads in the final third.",
    ],
    complimentTemplates: ["Your timeline shows pressure and effectiveness."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "kroos",
    playerName: "Toni Kroos",
    safeDisplayName: "Toni Kroos",
    traits: ["systematic", "calm"],
    strengths: ["control", "clarity"],
    weaknesses: ["hype", "unplanned motion"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: ["Control with occasional hype in the final third."],
    complimentTemplates: ["Your timeline shows control and clarity."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "salah",
    playerName: "Mohamed Salah",
    safeDisplayName: "Mohamed Salah",
    traits: ["consistent", "focused"],
    strengths: ["repeatable output", "professionalism"],
    weaknesses: ["spontaneity", "sharing the spotlight"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Repeatable output with occasional spontaneity in the final third.",
    ],
    complimentTemplates: [
      "Your timeline shows repeatable output and professionalism.",
    ],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "saka",
    playerName: "Bukayo Saka",
    safeDisplayName: "Bukayo Saka",
    traits: ["positive", "reliable"],
    strengths: ["adaptability", "team value"],
    weaknesses: ["villain energy", "dramatic posting"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Adaptability with occasional villain energy in the final third.",
    ],
    complimentTemplates: ["Your timeline shows adaptability and team value."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "modric",
    playerName: "Luka Modrić",
    safeDisplayName: "Luka Modrić",
    traits: ["elegant", "durable"],
    strengths: ["orchestration", "longevity"],
    weaknesses: ["loud branding", "obvious effort"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Orchestration with occasional loud branding in the final third.",
    ],
    complimentTemplates: ["Your timeline shows orchestration and longevity."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "rodri",
    playerName: "Rodri",
    safeDisplayName: "Rodri",
    traits: ["structured", "controlling"],
    strengths: ["systems thinking", "tempo"],
    weaknesses: ["flashiness", "shipping without a framework"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Systems thinking with occasional flashiness in the final third.",
    ],
    complimentTemplates: ["Your timeline shows systems thinking and tempo."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "vinicius",
    playerName: "Vinícius Júnior",
    safeDisplayName: "Vinícius Júnior",
    traits: ["electric", "bold"],
    strengths: ["momentum", "creative attack"],
    weaknesses: ["ignoring replies", "low-drama launches"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Momentum with occasional ignoring replies in the final third.",
    ],
    complimentTemplates: ["Your timeline shows momentum and creative attack."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "griezmann",
    playerName: "Antoine Griezmann",
    safeDisplayName: "Antoine Griezmann",
    traits: ["versatile", "playful"],
    strengths: ["connection", "work rate"],
    weaknesses: ["single-lane focus", "serious profile photos"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Connection with occasional single-lane focus in the final third.",
    ],
    complimentTemplates: ["Your timeline shows connection and work rate."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "son",
    playerName: "Son Heung-min",
    safeDisplayName: "Son Heung-min",
    traits: ["warm", "clinical"],
    strengths: ["finishing", "likeability"],
    weaknesses: ["cynicism", "unfriendly banter"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: ["Finishing with occasional cynicism in the final third."],
    complimentTemplates: ["Your timeline shows finishing and likeability."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "martinez",
    playerName: "Emiliano Martínez",
    safeDisplayName: "Emiliano Martínez",
    traits: ["provocative", "clutch"],
    strengths: ["mind games", "big-moment nerve"],
    weaknesses: ["subtle celebrations", "neutral captions"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Mind games with occasional subtle celebrations in the final third.",
    ],
    complimentTemplates: [
      "Your timeline shows mind games and big-moment nerve.",
    ],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "van-dijk",
    playerName: "Virgil van Dijk",
    safeDisplayName: "Virgil van Dijk",
    traits: ["composed", "authoritative"],
    strengths: ["calm defense", "presence"],
    weaknesses: ["panic posting", "tiny opinions"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Calm defense with occasional panic posting in the final third.",
    ],
    complimentTemplates: ["Your timeline shows calm defense and presence."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "mbappe",
    playerName: "Kylian Mbappé",
    safeDisplayName: "Kylian Mbappé",
    traits: ["fast", "strategic"],
    strengths: ["acceleration", "ambition"],
    weaknesses: ["slow consensus", "small announcements"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Acceleration with occasional slow consensus in the final third.",
    ],
    complimentTemplates: ["Your timeline shows acceleration and ambition."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
  {
    id: "mourinho",
    playerName: "José Mourinho",
    safeDisplayName: "José Mourinho",
    traits: ["combative", "narrative-driven"],
    strengths: ["positioning", "quote value"],
    weaknesses: ["taking the blame quietly", "boring press conferences"],
    suitableSignals: [
      "consistent public themes",
      "recognizable communication style",
    ],
    unsuitableSignals: ["insufficient public evidence"],
    roastTemplates: [
      "Positioning with occasional taking the blame quietly in the final third.",
    ],
    complimentTemplates: ["Your timeline shows positioning and quote value."],
    positionProfile: ["Timeline playmaker"],
    intensityRange: ["friendly", "derby", "red-card"],
  },
] as const satisfies readonly PlayerArchetype[];
export const ARCHETYPE_IDS = ARCHETYPES.map((entry) => entry.id);
export function getArchetype(id: string): PlayerArchetype {
  const entry = ARCHETYPES.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown archetype: ${id}`);
  return entry;
}

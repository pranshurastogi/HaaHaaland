import { ScoutExperience } from "@/components/scout-experience";

const enabled = (name: string, fallback: boolean) => {
  const value = process.env[name];
  return value === undefined ? fallback : value === "true";
};

export default function Home() {
  const manualPostsEnabled = enabled("FEATURE_MANUAL_POSTS", true);
  const leaderboardEnabled = enabled("FEATURE_LEADERBOARD", true);
  return (
    <main>
      <header className="nav">
        <a className="brand" href="/" aria-label="HaaHaaLand home">
          <span className="brand-ball">H</span> HaaHaaLand
        </a>
        <span className="nav-copy">
          Your timeline, scouted. Your ego, benched.
        </span>
        {leaderboardEnabled && (
          <a className="text-link" href="#leaderboard">
            Leaderboard
          </a>
        )}
      </header>
      <ScoutExperience
        manualPostsEnabled={manualPostsEnabled}
        leaderboardEnabled={leaderboardEnabled}
      />
    </main>
  );
}

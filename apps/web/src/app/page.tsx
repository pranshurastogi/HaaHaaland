import { ScoutExperience } from "@/components/scout-experience";
export default function Home() {
  return (
    <main>
      <header className="nav">
        <a className="brand" href="/" aria-label="HaaHaaLand home">
          <span className="brand-ball">H</span> HaaHaaLand
        </a>
        <span className="nav-copy">
          Your timeline, scouted. Your ego, benched.
        </span>
        <a className="text-link" href="#leaderboard">
          Leaderboard
        </a>
      </header>
      <ScoutExperience />
    </main>
  );
}

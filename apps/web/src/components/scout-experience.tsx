"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
const steps = [
  "Checking the dressing room…",
  "Scouting the timeline…",
  "Reviewing the tape…",
  "Calling VAR…",
];
export function ScoutExperience({
  manualPostsEnabled,
  leaderboardEnabled,
}: {
  manualPostsEnabled: boolean;
  leaderboardEnabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([""]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    track("landing_view");
    track("example_card_view");
    const referral = new URLSearchParams(window.location.search).get("ref");
    if (referral && /^[A-Za-z0-9_-]{8,80}$/.test(referral)) {
      sessionStorage.setItem("hhl:referral", referral);
      track("referral_landed", { referralPresent: true });
    }
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    track("username_submitted", {
      referralPresent: Boolean(sessionStorage.getItem("hhl:referral")),
    });
    track("research_started");
    track("generation_started");
    setLoading(true);
    setError("");
    setStep(0);
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, steps.length - 1)),
      550,
    );
    try {
      let sessionId = localStorage.getItem("hhl:session-id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("hhl:session-id", sessionId);
      }
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          xUsername: formData.get("xUsername"),
          instagramUsername: formData.get("instagramUsername"),
          manualPosts: posts.filter(Boolean),
          intensity: formData.get("intensity"),
          referralCode: sessionStorage.getItem("hhl:referral") ?? undefined,
          sessionId,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error?.message ??
            data.message ??
            "The scout lost the tape. Try again.",
        );
      track("research_completed", {
        confidenceBucket:
          data.card.researchConfidence < 40
            ? "low"
            : data.card.researchConfidence < 70
              ? "medium"
              : "high",
      });
      if (data.card.researchConfidence < 40) track("research_low_confidence");
      if (sessionStorage.getItem("hhl:referral"))
        track("referral_generation_completed");
      sessionStorage.setItem(`card:${data.id}`, JSON.stringify(data.card));
      sessionStorage.setItem(`card:${data.id}:token`, data.managementToken);
      const referral = sessionStorage.getItem("hhl:referral");
      if (referral) {
        const accepted = await fetch(
          `/api/challenges/${encodeURIComponent(referral)}`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              acceptedCardId: data.id,
              managementToken: data.managementToken,
              sessionId,
            }),
          },
        ).catch(() => null);
        if (accepted?.ok) {
          track("challenge_accepted", { cardId: data.id });
          sessionStorage.removeItem("hhl:referral");
        }
      }
      track("generation_completed", {
        confidence: data.card.researchConfidence,
        fallback: data.meta?.model === "deterministic-fallback",
      });
      router.push(`/card/${data.id}`);
    } catch (e) {
      track("generation_failed", { category: "request_failed" });
      setError(e instanceof Error ? e.message : "Unable to generate card");
      setLoading(false);
    } finally {
      clearInterval(timer);
    }
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> AI FOOTBALL SCOUTING GROUND
          </div>
          <h1>Which footballer is hiding in your timeline?</h1>
          <p className="lede">
            Connect your public X and Instagram identities. We scout both, show
            the source of your profile photo, and turn the receipts into one
            unapologetically shiny football card.
          </p>
          <form onSubmit={submit} className="scout-form">
            <div className="social-inputs">
              <label htmlFor="xUsername">
                <span>X / Twitter</span>
                <div className="social-input x-input">
                  <b>𝕏</b>
                  <span>@</span>
                  <input
                    id="xUsername"
                    name="xUsername"
                    required
                    maxLength={50}
                    autoComplete="off"
                    placeholder="xhandle"
                    onFocus={() => track("username_input_started")}
                    aria-describedby={error ? "scout-error" : undefined}
                  />
                </div>
              </label>
              <label htmlFor="instagramUsername">
                <span>Instagram</span>
                <div className="social-input instagram-input">
                  <b>◎</b>
                  <span>@</span>
                  <input
                    id="instagramUsername"
                    name="instagramUsername"
                    required
                    maxLength={30}
                    autoComplete="off"
                    placeholder="instahandle"
                  />
                </div>
              </label>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {loading ? steps[step] : "Ready to scout a public timeline."}
            </p>
            <div className="form-grid compact">
              <label>
                Roast intensity
                <select name="intensity" defaultValue="derby">
                  <option value="friendly">Friendly</option>
                  <option value="derby">Derby</option>
                  <option value="red-card">Red Card</option>
                </select>
              </label>
              <button
                className="button scout-submit"
                disabled={loading || !mounted}
              >
                {loading ? steps[step] : "Build My Scout Card"}
              </button>
            </div>
            {manualPostsEnabled && (
              <details>
                <summary>
                  Public profile looking quiet? Add sample posts
                </summary>
                <p className="hint">
                  Paste up to three public excerpts. Never include private
                  messages.
                </p>
                {posts.map((post, i) => (
                  <textarea
                    key={i}
                    aria-label={`Public post excerpt ${i + 1}`}
                    maxLength={500}
                    value={post}
                    onChange={(e) =>
                      setPosts((p) =>
                        p.map((v, j) => (j === i ? e.target.value : v)),
                      )
                    }
                    placeholder="A public post excerpt…"
                  />
                ))}
                {posts.length < 3 && (
                  <button
                    type="button"
                    className="add-post"
                    onClick={() => setPosts((p) => [...p, ""])}
                  >
                    + Add excerpt
                  </button>
                )}
              </details>
            )}
            {error && (
              <p id="scout-error" className="error" role="alert">
                {error}
              </p>
            )}
            <p className="privacy">
              Both public profiles required · No login · No private data
            </p>
          </form>
          <a className="secondary-link" href="#startup">
            Roast My Startup XI <span>→</span>
          </a>
        </div>
        <ExampleCard />
      </section>
      <section className="ticker" aria-label="How it works">
        <span>01 PUBLIC SIGNALS</span>
        <span>02 ARCHETYPE MATCH</span>
        <span>03 ROAST + COMPLIMENT</span>
        <span>04 SHARE THE RECEIPTS</span>
      </section>
      <section className="how">
        <div>
          <div className="eyebrow">NO PRIVATE DATA. NO FAKE SCOUTS.</div>
          <h2>A football opinion generator with receipts.</h2>
        </div>
        <div className="principles">
          <p>
            <b>Confidence-aware</b>
            <br />
            Sparse evidence gets a provisional verdict, not made-up certainty.
          </p>
          <p>
            <b>Original cards</b>
            <br />
            No club logos, player photos, or borrowed game-card designs.
          </p>
          <p>
            <b>Built to travel</b>
            <br />
            Download, share, challenge a friend. Every result starts the next
            match.
          </p>
        </div>
      </section>
      {leaderboardEnabled && (
        <section id="leaderboard" className="leaderboard">
          <div>
            <div className="eyebrow">LIVE TABLE</div>
            <h2>The dressing room</h2>
          </div>
          <ol>
            <li>
              <span>1</span>
              <b>@you, after saving</b>
              <em>— Aura pending</em>
            </li>
            <li>
              <span>2</span>
              <b>The next brave timeline</b>
              <em>— Scout opens soon</em>
            </li>
          </ol>
        </section>
      )}
      <section id="startup" className="startup">
        <div className="tape">SECONDARY MODE · WARMING UP</div>
        <h2>Roast My Startup XI</h2>
        <p>
          Product research mode is benched until the core scouting flow is
          production-proven. Sensible squad management.
        </p>
      </section>
      <footer>
        <b>HaaHaaLand</b>
        <span>
          Playful comparisons based on public evidence. Not affiliated with any
          player, club, league, or football game. <a href="/privacy">Privacy</a>
        </span>
      </footer>
    </>
  );
}
function ExampleCard() {
  return (
    <div className="example-wrap">
      <div className="stamp">EXAMPLE REPORT</div>
      <article className="scout-card mini">
        <div className="card-top">
          <span>HHL / 001</span>
          <span>CONFIDENCE 84%</span>
        </div>
        <div className="player-mark">CP</div>
        <p className="position">TIMELINE PLAYMAKER</p>
        <h2>
          Cold Palmer under pressure.
          <br />
          <i>Warm Notion doc in production.</i>
        </h2>
        <div className="stats">
          <div>
            <b>92</b>
            <span>AURA</span>
          </div>
          <div>
            <b>86</b>
            <span>CLUTCH</span>
          </div>
          <div>
            <b>71</b>
            <span>OUTPUT</span>
          </div>
        </div>
        <p className="verdict">
          Calm delivery, dangerous timing, suspicious attachment to “quick
          updates.”
        </p>
        <div className="card-foot">
          <span>SCOUTED BY HaaHaaLand</span>
          <strong>DECISION STANDS</strong>
        </div>
      </article>
      <span className="scribble">← this could be you</span>
    </div>
  );
}

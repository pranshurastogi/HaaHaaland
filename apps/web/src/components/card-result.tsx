"use client";
import { useEffect, useRef, useState } from "react";
import type { ScoutCard } from "@haahaaland/shared";
import { track } from "@/lib/analytics";
export function CardResult({
  id,
  initialCard,
}: {
  id: string;
  initialCard: ScoutCard | null;
}) {
  const [card, setCard] = useState<ScoutCard | null>(initialCard);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);
  const [varStatus, setVarStatus] = useState("");
  const [friendHandle, setFriendHandle] = useState("");
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (initialCard) return;
    const cached = sessionStorage.getItem(`card:${id}`);
    if (cached) {
      setCard(JSON.parse(cached));
      return;
    }
    fetch(`/api/cards/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setCard(d.card))
      .catch(() =>
        setError("This scout report is no longer in the dressing room."),
      );
  }, [id, initialCard]);
  useEffect(() => {
    if (card) {
      track("result_viewed", { confidence: card.researchConfidence });
      track("email_prompt_viewed", { cardId: id });
    }
  }, [card, id]);
  if (error)
    return (
      <section className="result-shell">
        <h1>Full-time whistle.</h1>
        <p>{error}</p>
        <a href="/" className="button">
          Scout a new timeline
        </a>
      </section>
    );
  if (!card)
    return (
      <section className="loading" role="status" aria-live="polite">
        <div className="spinner" />
        <h1>Reviewing the tape…</h1>
      </section>
    );
  const resultUrl = typeof window !== "undefined" ? window.location.href : "";
  const resultDomain =
    typeof window !== "undefined" ? window.location.host : "haahaaland.app";
  const managementToken =
    typeof window !== "undefined"
      ? sessionStorage.getItem(`card:${id}:token`)
      : null;
  const sessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("hhl:session-id")
      : null;
  const shareText = card.shareCopy;
  async function save(fd: FormData) {
    if (!managementToken) {
      setVarStatus("Only the browser that generated this card can save it.");
      return;
    }
    try {
      const response = await fetch("/api/cards/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: id,
          email: fd.get("email"),
          managementToken,
        }),
      });
      setSaved(response.ok);
      if (response.ok) {
        track("email_saved", { cardId: id });
        track("activation_completed", { cardId: id });
      } else {
        const payload = await response.json().catch(() => null);
        setVarStatus(
          payload?.error?.message ?? "Saving is temporarily unavailable.",
        );
      }
    } catch {
      setVarStatus("Saving is temporarily unavailable.");
    }
  }
  async function challenge() {
    if (!managementToken || !sessionId) {
      setVarStatus(
        "Only the browser that generated this card can challenge it.",
      );
      return;
    }
    try {
      const response = await fetch("/api/challenges", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: id,
          managementToken,
          sessionId,
          ...(friendHandle.trim() ? { friendHandle: friendHandle.trim() } : {}),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setVarStatus(
          payload?.error?.message ?? "Challenge creation is unavailable.",
        );
        return;
      }
      const url = new URL(
        payload.url ?? `/?ref=${id}`,
        location.origin,
      ).toString();
      await navigator.clipboard.writeText(url);
      track("challenge_created", { cardId: id });
      track("activation_completed", { cardId: id });
      setCopied(true);
    } catch {
      setVarStatus("Challenge creation or clipboard access is unavailable.");
    }
  }
  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setResultCopied(true);
      track("copy_link_clicked", { cardId: id });
    } catch {
      setVarStatus(
        "Clipboard access is unavailable. Copy the browser URL instead.",
      );
    }
  }
  async function appealToVar() {
    track("var_review_started", { cardId: id });
    try {
      const response = await fetch("/api/var-review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cardId: id,
          objection: "The comparison feels wrong.",
        }),
      });
      const payload = await response.json().catch(() => null);
      setVarStatus(
        payload?.error?.message ??
          "VAR review is locked until one qualified referral completes.",
      );
      if (response.ok) track("var_review_completed", { cardId: id });
    } catch {
      setVarStatus("VAR review is temporarily unavailable.");
    }
  }
  function download() {
    const current = card;
    if (!current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const c = canvas.getContext("2d");
    if (!c) return;
    c.fillStyle = "#161914";
    c.fillRect(0, 0, 1080, 1080);
    c.fillStyle = "#f3ff63";
    c.fillRect(70, 65, 940, 12);
    c.fillStyle = "#fdfdf8";
    c.font = "bold 42px Arial";
    c.fillText("HaaHaaLand · SCOUT REPORT", 70, 140);
    c.font = "bold 90px Arial";
    c.fillText(`@${current.handle}`.slice(0, 20), 70, 280);
    c.fillStyle = "#f3ff63";
    c.font = "bold 54px Arial";
    wrap(c, current.headline, 70, 360, 940, 58);
    c.fillStyle = "#fdfdf8";
    c.font = "30px Arial";
    wrap(c, current.roast, 70, 500, 940, 42);
    current.stats.forEach((s, i) => {
      const x = 70 + (i % 3) * 315,
        y = 700 + Math.floor(i / 3) * 130;
      c.fillStyle = "#f3ff63";
      c.font = "bold 72px Arial";
      c.fillText(String(s.value), x, y);
      c.fillStyle = "#fdfdf8";
      c.font = "bold 25px Arial";
      c.fillText(s.label.toUpperCase(), x, y + 42);
    });
    c.font = "28px Arial";
    c.fillStyle = "#bfc1b7";
    c.fillText("Your timeline, scouted. Your ego, benched.", 70, 1030);
    const a = document.createElement("a");
    a.download = `haahaaland-${current.handle}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    track("download_clicked", { cardId: id });
  }
  return (
    <section className="result-shell">
      <div className="result-heading">
        <div>
          <div className="eyebrow">
            <span className="live-dot" /> SCOUT REPORT
          </div>
          <h1>The verdict is in.</h1>
          <p>
            Public evidence. Playful opinion. Absolutely no transfer committee
            oversight.
          </p>
        </div>
        <div className="confidence">
          <b>{Math.round(card.researchConfidence)}%</b>
          <span>
            RESEARCH
            <br />
            CONFIDENCE
          </span>
        </div>
      </div>
      <article ref={cardRef} className="scout-card result-card">
        <div className="card-top">
          <span>HHL / {id.slice(0, 6).toUpperCase()}</span>
          <span>{card.position.toUpperCase()}</span>
        </div>
        <div className="result-identity">
          <div className="player-mark large">
            {card.primaryArchetypeId.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="position">@{card.handle}</p>
            <h2>{card.headline}</h2>
            <p className="archetype">
              Primary archetype · {card.primaryArchetypeId.replaceAll("-", " ")}
              {card.secondaryArchetypeId
                ? ` · Secondary comparison · ${card.secondaryArchetypeId.replaceAll("-", " ")}`
                : ""}
            </p>
          </div>
        </div>
        <div className="stat-grid">
          {card.stats.map((s) => (
            <div key={s.key}>
              <b>{s.value}</b>
              <span
                title={
                  s.key === "fraudRisk"
                    ? "Football-meme score for online hype versus visible public output. It is not an accusation of financial or criminal fraud."
                    : undefined
                }
              >
                {s.label}
                {s.key === "fraudRisk" ? (
                  <button
                    type="button"
                    className="stat-help"
                    aria-label="Explain Fraud Risk score"
                    title="Football-meme score only; never an allegation."
                  >
                    ?
                  </button>
                ) : null}
              </span>
              <small>{s.reason}</small>
            </div>
          ))}
        </div>
        <div className="verdict-grid">
          <div>
            <span>THE ROAST</span>
            <p>{card.roast}</p>
          </div>
          <div>
            <span>THE SCOUT'S NOTE</span>
            <p>{card.compliment}</p>
          </div>
        </div>
        <div className="var">
          <b>VAR</b>
          <p>{card.varVerdict}</p>
        </div>
        <p className="evidence">{card.evidenceSummary}</p>
        <div className="card-foot">
          <span>{card.transferValue}</span>
          <strong>DECISION STANDS</strong>
        </div>
        <div className="public-card-footer">
          <span>{resultDomain}</span>
          <span>{id.slice(0, 12)}</span>
          <span>Public-web scouting; just for fun.</span>
        </div>
      </article>
      <div className="actions">
        <button className="button" onClick={download}>
          Download PNG
        </button>
        <a
          className="share x"
          onClick={() => track("share_x_clicked", { cardId: id })}
          target="_blank"
          rel="noreferrer"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultUrl)}`}
        >
          Share on X
        </a>
        <a
          className="share whatsapp"
          onClick={() => track("share_whatsapp_clicked", { cardId: id })}
          target="_blank"
          rel="noreferrer"
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${resultUrl}`)}`}
        >
          Share on WhatsApp
        </a>
        <button className="share" onClick={copyResult}>
          {resultCopied ? "Result link copied!" : "Copy result link"}
        </button>
        <label className="challenge-handle">
          <span className="sr-only">Friend&apos;s X handle</span>
          <input
            value={friendHandle}
            onChange={(event) => setFriendHandle(event.target.value)}
            maxLength={16}
            placeholder="Friend's @handle (optional)"
            aria-label="Friend's X handle"
          />
        </label>
        <button className="share challenge" onClick={challenge}>
          {copied ? "Challenge copied!" : "Challenge a friend"}
        </button>
        <button className="share var-appeal" onClick={appealToVar}>
          This is wrong — appeal to VAR
        </button>
      </div>
      {varStatus ? (
        <p className="status-message" role="status" aria-live="polite">
          {varStatus}
        </p>
      ) : null}
      <form action={save} className="save-form">
        <div>
          <h2>Put this card in the trophy cabinet.</h2>
          <p>
            Save it, enter the leaderboard, and earn referral credit. No
            password circus.
          </p>
        </div>
        <div className="save-controls">
          <label className="sr-only" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
          <button className="button">
            {saved ? "Saved ✓" : "Save my card"}
          </button>
        </div>
      </form>
      <div className="again">
        <a href="/">Scout another timeline →</a>
      </div>
    </section>
  );
}
function wrap(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  max: number,
  line: number,
) {
  const words = text.split(" ");
  let current = "";
  for (const word of words) {
    const test = `${current}${word} `;
    if (c.measureText(test).width > max && current) {
      c.fillText(current, x, y);
      current = `${word} `;
      y += line;
    } else current = test;
  }
  c.fillText(current, x, y);
}

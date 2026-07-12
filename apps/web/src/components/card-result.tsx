"use client";
import { useEffect, useRef, useState } from "react";
import type { ScoutCard } from "@haahaaland/shared";
import { track } from "@/lib/analytics";
export function CardResult({ id }: { id: string }) {
  const [card, setCard] = useState<ScoutCard | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
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
  }, [id]);
  useEffect(() => {
    if (card) track("result_viewed", { confidence: card.researchConfidence });
  }, [card]);
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
      <section className="loading">
        <div className="spinner" />
        <h1>Reviewing the tape…</h1>
      </section>
    );
  const resultUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = card.shareCopy;
  async function save(fd: FormData) {
    const r = await fetch("/api/cards/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId: id, email: fd.get("email") }),
    });
    setSaved(r.ok);
    if (r.ok) track("email_saved");
  }
  async function challenge() {
    const r = await fetch("/api/challenges", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ cardId: id }),
    });
    const d = await r.json();
    const url = new URL(d.url ?? `/?ref=${id}`, location.origin).toString();
    await navigator.clipboard.writeText(url);
    track("challenge_created");
    setCopied(true);
  }
  function download() {
    const current = card;
    if (!current) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1500;
    const c = canvas.getContext("2d");
    if (!c) return;
    c.fillStyle = "#161914";
    c.fillRect(0, 0, 1200, 1500);
    c.fillStyle = "#f3ff63";
    c.fillRect(70, 65, 1060, 12);
    c.fillStyle = "#fdfdf8";
    c.font = "bold 42px Arial";
    c.fillText("HaaHaaLand · SCOUT REPORT", 70, 140);
    c.font = "bold 90px Arial";
    c.fillText(`@${current.handle}`.slice(0, 20), 70, 280);
    c.fillStyle = "#f3ff63";
    c.font = "bold 54px Arial";
    wrap(c, current.headline, 70, 390, 1020, 64);
    c.fillStyle = "#fdfdf8";
    c.font = "34px Arial";
    wrap(c, current.roast, 70, 620, 1020, 48);
    current.stats.forEach((s, i) => {
      const x = 70 + (i % 3) * 350,
        y = 930 + Math.floor(i / 3) * 170;
      c.fillStyle = "#f3ff63";
      c.font = "bold 72px Arial";
      c.fillText(String(s.value), x, y);
      c.fillStyle = "#fdfdf8";
      c.font = "bold 25px Arial";
      c.fillText(s.label.toUpperCase(), x, y + 42);
    });
    c.font = "28px Arial";
    c.fillStyle = "#bfc1b7";
    c.fillText("Your timeline, scouted. Your ego, benched.", 70, 1420);
    const a = document.createElement("a");
    a.download = `haahaaland-${current.handle}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    track("png_downloaded");
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
            </p>
          </div>
        </div>
        <div className="stat-grid">
          {card.stats.map((s) => (
            <div key={s.key}>
              <b>{s.value}</b>
              <span>{s.label}</span>
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
      </article>
      <div className="actions">
        <button className="button" onClick={download}>
          Download PNG
        </button>
        <a
          className="share x"
          onClick={() => track("share_clicked", { channel: "x" })}
          target="_blank"
          rel="noreferrer"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultUrl)}`}
        >
          Share on X
        </a>
        <a
          className="share whatsapp"
          onClick={() => track("share_clicked", { channel: "whatsapp" })}
          target="_blank"
          rel="noreferrer"
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${resultUrl}`)}`}
        >
          Share on WhatsApp
        </a>
        <button className="share challenge" onClick={challenge}>
          {copied ? "Challenge copied!" : "Copy challenge link"}
        </button>
      </div>
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

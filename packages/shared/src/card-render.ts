import type { ScoutCard } from "./index";

export type CardImageVariant = "square" | "og";

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character] ?? character;
  });
}

function lines(
  value: string,
  maxCharacters: number,
  maxLines: number,
): string[] {
  const words = value.trim().split(/\s+/);
  const output: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharacters && current) {
      output.push(current);
      current = word;
      if (output.length === maxLines - 1) break;
    } else current = candidate;
  }
  if (output.length < maxLines && current) output.push(current);
  if (words.join(" ").length > output.join(" ").length && output.length)
    output[output.length - 1] =
      `${output[output.length - 1]!.replace(/[.…]+$/, "")}…`;
  return output;
}

function textLines(
  value: string,
  x: number,
  y: number,
  maxCharacters: number,
  maxLines: number,
  lineHeight: number,
  className: string,
): string {
  return lines(value, maxCharacters, maxLines)
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`,
    )
    .join("");
}

export function renderScoutCardSvg(
  card: ScoutCard,
  cardId: string,
  variant: CardImageVariant = "square",
  domain = "haahaaland.app",
): string {
  const og = variant === "og";
  const width = og ? 1200 : 1080;
  const height = og ? 630 : 1080;
  const accent = "#f0ff58";
  const panel = "#1d241f";
  const titleY = og ? 220 : 300;
  const statsY = og ? 390 : 565;
  const statWidth = og ? 155 : 290;
  const statGap = og ? 12 : 20;
  const statStartX = og ? 610 : 70;
  const statColumns = og ? 3 : 3;
  const stats = card.stats
    .map((stat, index) => {
      const column = index % statColumns;
      const row = Math.floor(index / statColumns);
      const x = statStartX + column * (statWidth + statGap);
      const y = statsY + row * (og ? 105 : 135);
      return `<g><rect x="${x}" y="${y}" width="${statWidth}" height="${og ? 88 : 112}" rx="8" fill="${panel}" stroke="#415047"/><text x="${x + 16}" y="${y + (og ? 42 : 50)}" class="score">${stat.value}</text><text x="${x + 16}" y="${y + (og ? 68 : 82)}" class="label">${escapeXml(stat.label.replace("*", ""))}</text></g>`;
    })
    .join("");
  const accessible = `${card.displayName ?? `@${card.handle}`}. ${card.headline}. ${card.roast} ${card.compliment}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">HaaHaaLand scout card for ${escapeXml(card.displayName ?? `@${card.handle}`)}</title><desc id="description">${escapeXml(accessible)}</desc>
<style>.brand{font:900 30px Arial,sans-serif;fill:#f8f9f3}.meta{font:700 14px ui-monospace,monospace;letter-spacing:2px;fill:#9edcff}.handle{font:900 ${og ? 48 : 62}px Arial,sans-serif;fill:#f8f9f3}.headline{font:900 ${og ? 46 : 52}px Arial,sans-serif;fill:#f0ff58}.body{font:500 ${og ? 22 : 25}px Arial,sans-serif;fill:#e8ebe4}.score{font:900 ${og ? 34 : 44}px Arial,sans-serif;fill:#f0ff58}.label{font:700 ${og ? 11 : 14}px ui-monospace,monospace;letter-spacing:1px;fill:#f8f9f3}.footer{font:600 ${og ? 12 : 15}px ui-monospace,monospace;fill:#aab4aa}</style>
<rect width="100%" height="100%" fill="#0b0f0d"/><path d="M0 0 L${width * 0.32} 0 L${width * 0.18} ${height} L0 ${height}Z" fill="#131a16"/><path d="M${width} 0 L${width * 0.68} 0 L${width * 0.82} ${height} L${width} ${height}Z" fill="#111713"/><path d="M${width * 0.5} 0 L${width * 0.61} ${height} L${width * 0.39} ${height}Z" fill="#151d18"/><rect x="${og ? 46 : 54}" y="${og ? 38 : 48}" width="${width - (og ? 92 : 108)}" height="8" fill="${accent}"/>
<text x="${og ? 48 : 58}" y="${og ? 92 : 108}" class="brand">HaaHaaLand</text><text x="${width - (og ? 330 : 390)}" y="${og ? 88 : 104}" class="meta">PUBLIC-WEB SCOUT REPORT · ${escapeXml(cardId.slice(0, 12).toUpperCase())}</text>
<text x="${og ? 48 : 58}" y="${og ? 155 : 190}" class="handle">${escapeXml(card.displayName ?? `@${card.handle}`)}</text><text x="${og ? 50 : 60}" y="${og ? 185 : 225}" class="meta">@${escapeXml(card.handle)} · ${escapeXml(card.position.toUpperCase())} · ${escapeXml(card.clubName.toUpperCase())}</text>
${textLines(card.headline, og ? 48 : 58, titleY, og ? 34 : 32, 2, og ? 52 : 58, "headline")}
<text x="${og ? 50 : 60}" y="${og ? 350 : 455}" class="meta">PRIMARY · ${escapeXml(card.primaryArchetypeId.toUpperCase())}${card.secondaryArchetypeId ? `   SECONDARY · ${escapeXml(card.secondaryArchetypeId.toUpperCase())}` : ""}</text>
${stats}
${og ? "" : textLines(card.roast, 60, 870, 76, 2, 32, "body")}${og ? "" : textLines(card.compliment, 60, 950, 76, 2, 32, "body")}
<rect x="${og ? 46 : 54}" y="${height - (og ? 78 : 72)}" width="${width - (og ? 92 : 108)}" height="1" fill="#415047"/><text x="${og ? 48 : 58}" y="${height - (og ? 45 : 38)}" class="footer">${escapeXml(domain)} · ${escapeXml(cardId.slice(0, 12))} · Public-web scouting; just for fun.</text><text x="${og ? 760 : 590}" y="${height - (og ? 45 : 38)}" class="footer">Fraud Risk is a football-meme score, not an allegation.</text>
</svg>`;
}

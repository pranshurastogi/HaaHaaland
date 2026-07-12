import { ImageResponse } from "next/og";
import { getServerCard } from "@/lib/server-card";

export const alt = "HaaHaaLand public-web football scout card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await getServerCard(id);
  if (!found) return new Response(null, { status: 404 });
  const card = found.card;
  const stats = card.stats;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 52,
        color: "#f8f9f3",
        background: "#0b0f0d",
        borderTop: "10px solid #f0ff58",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#9edcff",
          fontSize: 22,
        }}
      >
        <b>HaaHaaLand · PUBLIC-WEB SCOUT REPORT</b>
        <span>{id.slice(0, 12).toUpperCase()}</span>
      </div>
      <div style={{ display: "flex", flex: 1, gap: 52, paddingTop: 42 }}>
        <div style={{ width: 535, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 56, fontWeight: 900 }}>
            @{card?.handle ?? "full-time"}
          </div>
          <div
            style={{
              marginTop: 14,
              color: "#9edcff",
              fontSize: 20,
              textTransform: "uppercase",
            }}
          >
            {card?.position ?? "Card unavailable"} ·{" "}
            {card?.clubName ?? "HaaHaaLand"}
          </div>
          <div
            style={{
              marginTop: 38,
              fontSize: 48,
              lineHeight: 1.02,
              fontWeight: 900,
              color: "#f0ff58",
            }}
          >
            {card?.headline ?? "The scout report has left the tunnel."}
          </div>
          <div style={{ marginTop: "auto", fontSize: 20, color: "#c5cdc5" }}>
            {card
              ? `${card.primaryArchetypeId.toUpperCase()} · ${card.transferValue}`
              : "Public-web scouting; just for fun."}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignContent: "center",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.key}
              style={{
                width: 168,
                height: 114,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 18,
                border: "1px solid #415047",
                background: "#1d241f",
              }}
            >
              <b style={{ color: "#f0ff58", fontSize: 44 }}>{stat.value}</b>
              <span style={{ fontSize: 14, textTransform: "uppercase" }}>
                {stat.label.replace("*", "")}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          color: "#aab4aa",
          fontSize: 16,
        }}
      >
        <span>Public-web scouting; just for fun.</span>
        <span>Fraud Risk = football-meme hype vs visible output.</span>
      </div>
    </div>,
    size,
  );
}

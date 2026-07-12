const [webArg, apiArg] = process.argv.slice(2);
const web = (webArg ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const api = apiArg?.replace(/\/$/, "");

async function checked(url, init, expected = 200) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status !== expected)
    throw new Error(
      `${new URL(url).pathname} returned ${response.status}; expected ${expected}`,
    );
  console.log(`PASS ${new URL(url).pathname} ${response.status}`);
  return response;
}

await checked(`${web}/`);
await checked(`${web}/api/leaderboard`);

if (api) {
  await checked(`${api}/health`);
  await checked(`${api}/ready`);
  await checked(
    `${api}/v1/scout/profile`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ xUsername: "smokefc" }),
    },
    401,
  );
}

const generated = await checked(
  `${web}/api/generate`,
  {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": `smoke-${crypto.randomUUID()}`,
    },
    body: JSON.stringify({
      xUsername: "smokefc",
      manualPosts: [
        "Public test fixture: shipped a documented product update.",
      ],
      intensity: "friendly",
      sessionId: crypto.randomUUID(),
    }),
  },
  201,
);
const payload = await generated.json();
if (!payload.id || payload.card?.stats?.length !== 6)
  throw new Error("Generation response did not contain a valid six-stat card");
await checked(`${web}/card/${encodeURIComponent(payload.id)}`);
const image = await checked(
  `${web}/api/cards/${encodeURIComponent(payload.id)}/image`,
);
if (!image.headers.get("content-type")?.startsWith("image/svg+xml"))
  throw new Error("Card image returned an unexpected MIME type");
if (!image.headers.get("cache-control")?.includes("immutable"))
  throw new Error("Card image is missing immutable caching");
console.log("PASS analytics is optional/non-blocking in smoke mode");

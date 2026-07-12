const base = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const checks = ["/", "/api/leaderboard"];
for (const path of checks) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(base + path, { signal: controller.signal });
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    console.log(`PASS ${path} ${response.status}`);
  } finally {
    clearTimeout(timer);
  }
}

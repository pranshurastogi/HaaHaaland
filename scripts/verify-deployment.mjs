const [web, api] = process.argv.slice(2);
if (!web || !api) {
  console.error(
    "Usage: node scripts/verify-deployment.mjs <web-url> <api-url>",
  );
  process.exit(2);
}
for (const [name, url] of [
  ["web", web],
  ["api", `${api.replace(/\/$/, "")}/health`],
]) {
  const response = await fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`${name} failed: ${response.status}`);
  console.log(`PASS ${name}: ${response.status} ${new URL(url).origin}`);
}

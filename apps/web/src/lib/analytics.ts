type Props = Record<string, string | number | boolean | undefined>;
export function track(event: string, properties: Props = {}) {
  if (typeof window === "undefined") return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/$/, "");
  if (!key || !host) return;
  let distinct = localStorage.getItem("hhl:anonymous-id");
  if (!distinct) {
    distinct = crypto.randomUUID();
    localStorage.setItem("hhl:anonymous-id", distinct);
  }
  void fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event,
      properties: { ...properties, distinct_id: distinct, app: "HaaHaaLand" },
    }),
    keepalive: true,
  }).catch(() => undefined);
}

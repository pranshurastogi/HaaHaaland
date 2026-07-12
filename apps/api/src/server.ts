import { buildApp } from "./app";
function required(name: string): string {
  const value = process.env[name];
  if (!value)
    throw new Error(`Missing required production configuration: ${name}`);
  return value;
}
const production = process.env.NODE_ENV === "production";
const app = buildApp({
  proxySecret: production
    ? required("INTERNAL_PROXY_SECRET")
    : (process.env.INTERNAL_PROXY_SECRET ?? "local-development-only"),
  ...(process.env.LINKUP_API_KEY
    ? { linkupApiKey: process.env.LINKUP_API_KEY }
    : {}),
  ...(process.env.OPENAI_API_KEY
    ? { openaiApiKey: process.env.OPENAI_API_KEY }
    : {}),
  ...(process.env.OPENAI_MODEL
    ? { openaiModel: process.env.OPENAI_MODEL }
    : {}),
});
await app.listen({ host: "0.0.0.0", port: Number(process.env.PORT ?? 3001) });

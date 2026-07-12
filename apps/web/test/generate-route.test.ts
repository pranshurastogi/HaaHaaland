import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/app/api/generate/route";

const originalNodeEnv = process.env.NODE_ENV;
const originalFallback = process.env.LOCAL_FALLBACK_ENABLED;
const originalApi = process.env.RAILWAY_API_URL;
const originalSecret = process.env.INTERNAL_PROXY_SECRET;

afterEach(() => {
  vi.restoreAllMocks();
  Object.assign(process.env, {
    NODE_ENV: originalNodeEnv,
    LOCAL_FALLBACK_ENABLED: originalFallback,
    RAILWAY_API_URL: originalApi,
    INTERNAL_PROXY_SECRET: originalSecret,
  });
});

function request() {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      xUsername: "releasefc",
      instagramUsername: "releasefc",
      sessionId: "00000000-0000-4000-8000-000000000099",
    }),
  });
}

describe("production generation boundary", () => {
  it("fails closed when Railway is not configured", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.LOCAL_FALLBACK_ENABLED;
    delete process.env.RAILWAY_API_URL;
    delete process.env.INTERNAL_PROXY_SECRET;
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("SERVICE_UNAVAILABLE");
  });

  it("allows the deterministic fallback only with an explicit override", async () => {
    process.env.NODE_ENV = "production";
    process.env.LOCAL_FALLBACK_ENABLED = "true";
    delete process.env.RAILWAY_API_URL;
    delete process.env.INTERNAL_PROXY_SECRET;
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect((await response.json()).meta.model).toBe("deterministic-fallback");
  });

  it("returns a safe retryable error when Railway is unavailable", async () => {
    process.env.NODE_ENV = "production";
    process.env.RAILWAY_API_URL = "https://api.example.test";
    process.env.INTERNAL_PROXY_SECRET = ["test", "proxy", "placeholder"].join(
      "-",
    );
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("socket failed with internal detail"),
    );
    const response = await POST(request());
    const payload = await response.json();
    expect(response.status).toBe(502);
    expect(payload.error).toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      retryable: true,
    });
    expect(JSON.stringify(payload)).not.toContain("internal detail");
  });
});

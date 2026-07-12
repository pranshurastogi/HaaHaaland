import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app";
import { MemoryStateStore } from "../src/state";

const proxySecret = "test-secret";
const headers = { "x-haahaaland-proxy-secret": proxySecret };
const apps: ReturnType<typeof buildApp>[] = [];
afterEach(async () => Promise.all(apps.splice(0).map((app) => app.close())));

describe("state store integration", () => {
  it("persists stable image URLs returned by the backend image store", async () => {
    const stateStore = new MemoryStateStore();
    const app = buildApp({
      proxySecret,
      stateStore,
      imageStore: {
        store: async (id) => ({
          svgUrl: `https://cards.example.test/cards/${id}/card.svg`,
          pngUrl: `https://cards.example.test/cards/${id}/card.png`,
          ogUrl: `https://cards.example.test/cards/${id}/og.png`,
        }),
      },
    });
    apps.push(app);
    const generated = await app.inject({
      method: "POST",
      url: "/v1/scout/profile",
      headers,
      payload: {
        xUsername: "persistimagefc",
        sessionId: crypto.randomUUID(),
      },
    });
    expect(generated.statusCode).toBe(201);
    const payload = generated.json();
    expect(payload.images.pngUrl).toMatch(/\/card\.png$/);
    const reloaded = await app.inject({
      method: "GET",
      url: `/v1/cards/${payload.id}`,
      headers,
    });
    expect(reloaded.json().images).toEqual(payload.images);
  });

  it("reloads and mutates a card across independent API instances", async () => {
    const stateStore = new MemoryStateStore();
    const first = buildApp({ proxySecret, stateStore });
    const second = buildApp({ proxySecret, stateStore });
    apps.push(first, second);

    const sessionId = crypto.randomUUID();
    const idempotencyKey = "shared_store_key_123456";
    const generated = await first.inject({
      method: "POST",
      url: "/v1/scout/profile",
      headers: { ...headers, "idempotency-key": idempotencyKey },
      payload: {
        xUsername: "multinodefc",
        sessionId,
      },
    });
    expect(generated.statusCode).toBe(201);
    const payload = generated.json();

    const replay = await second.inject({
      method: "POST",
      url: "/v1/scout/profile",
      headers: { ...headers, "idempotency-key": idempotencyKey },
      payload: { xUsername: "multinodefc", sessionId },
    });
    expect(replay.statusCode).toBe(200);
    expect(replay.json().id).toBe(payload.id);

    const reloaded = await second.inject({
      method: "GET",
      url: `/v1/cards/${payload.id}`,
      headers,
    });
    expect(reloaded.statusCode).toBe(200);
    expect(reloaded.json().card.handle).toBe("multinodefc");

    const saved = await second.inject({
      method: "POST",
      url: `/v1/cards/${payload.id}/save`,
      headers,
      payload: {
        email: "owner@example.com",
        managementToken: payload.managementToken,
      },
    });
    expect(saved.statusCode).toBe(200);

    const leaderboard = await first.inject({
      method: "GET",
      url: "/v1/leaderboard",
      headers,
    });
    expect(leaderboard.json().entries).toEqual([
      expect.objectContaining({ id: payload.id, handle: "multinodefc" }),
    ]);
  });
});

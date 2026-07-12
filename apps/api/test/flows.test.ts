import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

const proxyHeaders = { "x-haahaaland-proxy-secret": "test-secret" };
const apps: ReturnType<typeof buildApp>[] = [];
afterEach(async () => Promise.all(apps.splice(0).map((app) => app.close())));

async function generate(
  app: ReturnType<typeof buildApp>,
  handle: string,
  idempotencyKey?: string,
  sessionId = crypto.randomUUID(),
) {
  return app.inject({
    method: "POST",
    url: "/v1/scout/profile",
    headers: {
      ...proxyHeaders,
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    },
    payload: { xUsername: handle, sessionId },
  });
}

describe("abuse and virality flows", () => {
  it("returns an idempotent generation without creating a duplicate", async () => {
    const app = buildApp({ proxySecret: "test-secret" });
    apps.push(app);
    const sessionId = crypto.randomUUID();
    const first = await generate(
      app,
      "idempotentfc",
      "idem_123456789012",
      sessionId,
    );
    const replay = await generate(
      app,
      "idempotentfc",
      "idem_123456789012",
      sessionId,
    );
    expect(first.statusCode).toBe(201);
    expect(replay.statusCode).toBe(200);
    expect(replay.json().id).toBe(first.json().id);
  });

  it("applies a handle cooldown", async () => {
    const app = buildApp({
      proxySecret: "test-secret",
      handleCooldownMs: 60_000,
    });
    apps.push(app);
    expect((await generate(app, "cooldownfc")).statusCode).toBe(201);
    const blocked = await generate(app, "cooldownfc");
    expect(blocked.statusCode).toBe(429);
    expect(blocked.json().error.code).toBe("RATE_LIMITED");
  });

  it("completes a challenge once and rejects self-credit", async () => {
    const app = buildApp({ proxySecret: "test-secret" });
    apps.push(app);
    const challengerSession = crypto.randomUUID();
    const opponentSession = crypto.randomUUID();
    const challenger = (
      await generate(app, "challengerfc", undefined, challengerSession)
    ).json();
    const opponent = (
      await generate(app, "opponentfc", undefined, opponentSession)
    ).json();
    const created = await app.inject({
      method: "POST",
      url: "/v1/challenges",
      headers: proxyHeaders,
      payload: {
        cardId: challenger.id,
        friendHandle: "@OpponentFC",
        managementToken: challenger.managementToken,
        sessionId: challengerSession,
      },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json().slug).toMatch(/^[a-f0-9]{32}$/);

    const self = await app.inject({
      method: "POST",
      url: `/v1/challenges/${created.json().slug}/accept`,
      headers: proxyHeaders,
      payload: {
        acceptedCardId: challenger.id,
        managementToken: challenger.managementToken,
        sessionId: challengerSession,
      },
    });
    expect(self.statusCode).toBe(409);

    const accepted = await app.inject({
      method: "POST",
      url: `/v1/challenges/${created.json().slug}/accept`,
      headers: proxyHeaders,
      payload: {
        acceptedCardId: opponent.id,
        managementToken: opponent.managementToken,
        sessionId: opponentSession,
      },
    });
    const replay = await app.inject({
      method: "POST",
      url: `/v1/challenges/${created.json().slug}/accept`,
      headers: proxyHeaders,
      payload: {
        acceptedCardId: opponent.id,
        managementToken: opponent.managementToken,
        sessionId: opponentSession,
      },
    });
    expect(accepted.statusCode).toBe(200);
    expect(replay.json()).toEqual(accepted.json());
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

async function generateCard(
  page: import("@playwright/test").Page,
  handle: string,
) {
  await page.goto("/");
  await page.getByLabel("X username").fill(handle);
  await page.getByRole("button", { name: "Scout My Timeline" }).click();
  await expect(page.getByText("SCOUT REPORT", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
}

test("visitor completes the activation and sharing journey", async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await generateCard(page, "@BuilderFC");

  await expect(page.getByText(/limited public data/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Share on X" })).toHaveAttribute(
    "href",
    /twitter\.com\/intent\/tweet/,
  );
  await expect(
    page.getByRole("link", { name: "Share on WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me/);
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Explain Fraud Risk score" }),
  ).toBeVisible();

  const cardId = new URL(page.url()).pathname.split("/").pop()!;
  const image = await request.get(`/api/cards/${cardId}/image`);
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/svg+xml");
  expect(image.headers()["cache-control"]).toContain("immutable");

  await page.getByLabel("Email address").fill("Scout@Example.com");
  await page.getByRole("button", { name: "Save my card" }).click();
  await expect(page.getByRole("button", { name: "Saved ✓" })).toBeVisible();

  await page.getByLabel("Friend's X handle").fill("@OpponentFC");
  await page.getByRole("button", { name: "Challenge a friend" }).click();
  await expect(
    page.getByRole("button", { name: "Challenge copied!" }),
  ).toBeVisible();
  const challengeUrl = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  await page.goto(challengeUrl);
  await expect(
    page.getByText("CHALLENGE ACCEPTED", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/predicted winner stays hidden/i)).toBeVisible();
});

test("invalid username fails safely and manual evidence is accessible", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("X username").fill("bad handle");
  await page.getByRole("button", { name: "Scout My Timeline" }).click();
  await expect(page.locator("#scout-error")).toContainText(/valid X username/i);

  await page
    .getByText("Public profile looking quiet? Add sample posts")
    .click();
  await page
    .getByLabel("Public post excerpt 1")
    .fill("I shipped a public product update and documented the launch.");
  await expect(page.getByLabel("Public post excerpt 1")).toHaveValue(/shipped/);
});

test("major controls are keyboard reachable and have no serious axe violations", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.getByLabel("X username").focus();
  await page.keyboard.type("keyboardfc");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Scout My Timeline" }),
  ).toBeFocused();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
});

import { expect, test } from "@playwright/test";
test("visitor scouts a timeline and reaches a shareable result", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Which footballer is hiding in your timeline?",
    }),
  ).toBeVisible();
  await page.getByLabel("X username").fill("@BuilderFC");
  await page.getByRole("button", { name: "Scout My Timeline" }).click();
  await expect(page.getByText("SCOUT REPORT", { exact: true })).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByRole("button", { name: /Copy challenge link/i }),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";

test.describe("a visitor without a wallet", () => {
  test("gets the home page, not a blank screen", async ({ page }) => {
    await page.goto("/home");

    await expect(
      page.getByRole("heading", { name: /unbox your luck/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "START NOW" })).toBeVisible();
  });

  test("sees the numbers the backend reports", async ({ page }) => {
    const stats = await page.request.get("http://localhost:8000/api/stats");
    const { orbsOpened } = await stats.json();

    await page.goto("/home");

    await expect(page.getByText("orbs opened")).toBeVisible();
    await expect(page.locator(".stats__tile").first()).toContainText(
      String(orbsOpened),
    );
  });

  test("is offered a connect button it cannot use", async ({ page }) => {
    await page.goto("/home");

    const connect = page.locator("app-navbar button.action-button");
    await expect(connect).toBeVisible();
    await expect(connect).toBeDisabled();
  });

  test("can read the FAQ", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("link", { name: "FAQ" }).click();

    const third = page.locator(".question").nth(2);
    await third.click();

    await expect(third).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText(/every input is on the blockchain/i),
    ).toBeVisible();
  });

  test("can check the odds", async ({ page }) => {
    await page.goto("/fairness");

    await expect(
      page.getByRole("heading", { name: /provably fair/i }),
    ).toBeVisible();
    await expect(page.locator("table.board").first()).toBeVisible();
  });
});

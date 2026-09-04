import { expect, test } from "@playwright/test";
import { freshFundedAccount } from "./rpc";
import { injectWallet } from "./wallet";

const API = process.env.E2E_API_URL ?? "http://localhost:8000/api";

test.describe("a player with a wallet", () => {
  test("opens a daily orb and the whole stack agrees on the result", async ({
    page,
  }) => {
    test.slow();

    const address = await freshFundedAccount();
    await injectWallet(page, address);

    await page.goto("/orbs");

    await page.locator("app-navbar button.action-button").click();
    await expect(page.locator("app-navbar .address")).toBeVisible();

    const daily = page.locator("app-orb").first();
    await expect(daily).toContainText("Daily");
    await daily.locator("button.action-button").click();

    await expect(page.locator(".unboxing")).toBeVisible();

    const opened = await expect
      .poll(
        async () => {
          const response = await page.request.get(
            `${API}/players/${address}/opens`,
          );
          if (!response.ok()) return 0;
          const { opens } = await response.json();
          return opens.length;
        },
        { timeout: 60_000, intervals: [2_000] },
      )
      .toBeGreaterThan(0)
      .then(async () => {
        const response = await page.request.get(
          `${API}/players/${address}/opens`,
        );
        const { opens } = await response.json();
        return opens[0];
      });

    expect(opened.points).toBeGreaterThan(0);
    expect(opened.commitBlock).toBeGreaterThan(0);
    expect(opened.revealBlock).toBeGreaterThan(opened.commitBlock);

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Your opens" }),
    ).toBeVisible();
    await expect(page.locator(".history tbody tr").first()).toContainText(
      String(opened.points),
    );
  });

  test("the leaderboard shows the points the chain paid out", async ({
    page,
  }) => {
    const address = await freshFundedAccount();
    await injectWallet(page, address);

    await page.goto("/leaderboard");
    await expect(page.locator("table.board").first()).toBeVisible();

    const response = await page.request.get(`${API}/leaderboard`);
    const { top } = await response.json();
    test.skip(top.length === 0, "nobody has opened an orb yet");

    await expect(page.locator("table.board tbody tr").first()).toContainText(
      String(top[0].points),
    );
  });
});

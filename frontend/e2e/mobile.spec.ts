import { expect, test } from "@playwright/test";

const ROUTES = [
  "/home",
  "/orbs",
  "/leaderboard",
  "/referrals",
  "/faq",
  "/fairness",
];
const WIDTHS = [320, 390, 768];

test.describe("small screens", () => {
  for (const width of WIDTHS) {
    test(`nothing spills sideways at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });

      for (const route of ROUTES) {
        await page.goto(route);
        await page.waitForTimeout(300);

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        expect(scrollWidth, `${route} at ${width}px`).toBeLessThanOrEqual(
          clientWidth,
        );
      }
    });
  }

  test("no scrollbar takes up room", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");

    const room = await page.evaluate(
      () => window.innerWidth - document.documentElement.clientWidth,
    );

    expect(room).toBe(0);
  });

  test("the menu covers the page and closes again", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");

    await page.locator("app-navbar .menu-button").click();

    const nav = page.locator("app-navbar nav");
    await expect(nav).toBeVisible();
    await expect(page.locator("app-footer")).toBeHidden();

    const close = page.locator("app-navbar #close");
    await expect(close).toBeVisible();
    await expect(close).toHaveCSS("fill", "rgb(0, 0, 0)");

    await close.click();
    await expect(nav).toBeHidden();
    await expect(page.locator("app-footer")).toBeVisible();
  });

  test("the menu keeps its links readable under the finger", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");
    await page.locator("app-navbar .menu-button").click();

    const link = page.locator("app-navbar nav a").first();
    await link.hover();

    await expect(link).toHaveCSS("color", "rgb(0, 0, 0)");
  });

  test("the connect button sits at the foot of the menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");
    await page.locator("app-navbar .menu-button").click();

    const box = await page.locator("app-navbar .action-button").boundingBox();

    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(400);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  });

  test("every menu link fits the screen", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/home");
    await page.locator("app-navbar .menu-button").click();

    for (const link of await page.locator("app-navbar nav a").all()) {
      const box = await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }
  });
  test("the menu fades rather than snapping", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");

    const seconds = () =>
      page.evaluate(() => {
        const nav = document.querySelector("app-navbar nav");
        const links = [...document.querySelectorAll("app-navbar nav a")];
        const delay = (el) => parseFloat(getComputedStyle(el).transitionDelay);
        return {
          duration: parseFloat(getComputedStyle(nav).transitionDuration),
          firstDelay: delay(links[0]),
          lastDelay: delay(links[links.length - 1]),
        };
      });

    expect((await seconds()).duration).toBeGreaterThan(0);

    await page.locator("app-navbar .menu-button").click();
    await expect(page.locator("app-navbar nav")).toBeVisible();

    const open = await seconds();
    expect(open.duration).toBeGreaterThan(0);
    expect(open.lastDelay).toBeGreaterThan(open.firstDelay);
  });

  test("the burger turns into the close icon", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto("/home");

    const burger = page.locator("app-navbar #burger");
    const close = page.locator("app-navbar #close");

    await expect(burger).toHaveCSS("opacity", "1");
    await expect(close).toHaveCSS("opacity", "0");

    await page.locator("app-navbar .menu-button").click();

    await expect(burger).toHaveCSS("opacity", "0");
    await expect(close).toHaveCSS("opacity", "1");
  });
});

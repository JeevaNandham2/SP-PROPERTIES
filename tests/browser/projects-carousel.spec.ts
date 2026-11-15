import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`project cards autoplay without controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/projects");
    const rail = page.locator(".sp-preview-rail");
    await rail.scrollIntoViewIfNeeded();
    const bounds = await rail.boundingBox();
    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 60);
    await expect(page.locator(".sp-card-controls")).toHaveCount(0);
    await expect(rail).toHaveCSS("scrollbar-width", "none");
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft), { timeout: 8000 }).toBeGreaterThan(45);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.locator(".sp-preview-card img").first()).toHaveJSProperty("complete", true);
    await rail.evaluate((el) => { el.scrollLeft = el.scrollWidth - el.clientWidth; });
    await page.screenshot({ path: `test-results/projects-carousel-${width}.png` });
  });
}

test("project cards respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/projects");
  const rail = page.locator(".sp-preview-rail");
  await rail.scrollIntoViewIfNeeded();
  await expect(rail).not.toHaveClass(/is-auto-scrolling/);
  const start = await rail.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(800);
  expect(await rail.evaluate((el) => el.scrollLeft)).toBe(start);
});

test("construction keywords appear in metadata and visible content", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Construction Company in Chennai/);
  await expect(page.locator("#intro-title")).toContainText("Construction Company");
  await page.goto("/services");
  await expect(page).toHaveTitle(/Building Contractors in Chennai/);
  await expect(page.locator("h1")).toContainText(/building contractors in Chennai/i);
});

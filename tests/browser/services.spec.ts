import { expect, test } from "@playwright/test";

for (const width of [390, 768, 1440]) {
  test(`services navigation and consultation work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/services");
    await expect(page.locator("h1")).toContainText(/building contractors in Chennai/i);
    await expect.poll(() => page.locator(".svc-hero-image").evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({ path: `test-results/services-${width}-hero.png` });
    await page.locator(".svc-navigation").getByRole("link", { name: /Interior planning/ }).click();
    await expect(page).toHaveURL(/\/services#interior-services$/);
    await expect(page.locator("#interior-services .svc-card-action")).toHaveAttribute("href", "/contact");
    await page.locator("#our-services").scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/services-${width}-cards.png` });
    await page.locator(".svc-faq").getByRole("button", { name: "Can you build a home on my plot?" }).click();
    await expect(page.locator(".svc-faq").getByRole("region", { name: "Can you build a home on my plot?" })).toBeVisible();
    await expect(page.locator(".svc-consultation-actions a").first()).toHaveAttribute("href", "/contact");
    expect(errors).toEqual([]);
  });
}

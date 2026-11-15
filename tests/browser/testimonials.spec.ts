import { expect, test } from "@playwright/test";
import { clientStories } from "../../content/testimonials";

for (const width of [390, 768, 1440]) {
  test(`client stories, buyer priorities and photo viewer work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/testimonials");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".stories-feature img")).toHaveJSProperty("complete", true);
    await expect(page.getByRole("button", { name: /View photo of/ })).toHaveCount(clientStories.length);
    await page.screenshot({ path: `test-results/testimonials-hero-${width}.png` });

    const options = page.getByRole("group", { name: "Choose your home priority" });
    await options.getByRole("button", { name: "The right location" }).click();
    await expect(page.getByRole("heading", { name: "Closer to what matters." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Find your neighbourhood" })).toHaveAttribute("href", "/projects#location-map");
    await expect(page.getByRole("link", { name: "Discuss on WhatsApp" })).toHaveAttribute("href", /choosing%20a%20home%20location/);
    await options.getByRole("button", { name: "Clarity before I decide" }).click();
    await expect(page.getByRole("heading", { name: "Your questions, welcomed." })).toBeVisible();
    await expect(options.locator('[aria-pressed="true"]')).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Discuss on WhatsApp" })).toHaveAttribute("href", /current%20prices/);
    await page.locator("#your-priorities").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/testimonials-priorities-${width}.png` });

    const trigger = page.getByRole("button", { name: "View photo of Samy and family" });
    await trigger.click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await expect(viewer.getByRole("button", { name: "Close photo viewer" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.locator("#photo-viewer-title")).toContainText("Balaji");
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.locator("#photo-viewer-title")).toContainText("Samy");
    await viewer.getByRole("button", { name: "Previous client photo" }).click();
    await expect(viewer.locator("#photo-viewer-title")).toContainText("Ramakrishnan");
    await expect.poll(() => viewer.locator("img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({ path: `test-results/testimonials-viewer-${width}.png` });
    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");

    await page.getByRole("button", { name: "View photo of Jagadesh and family" }).click();
    await page.getByRole("button", { name: "Close photo viewer" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    for (const client of clientStories) {
      const photo = page.locator(`#${client.id} img`);
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator("footer img").scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.locator(".stories-feature img").evaluate((img) => (img as HTMLImageElement).decode());
    // Allow the browser to repaint off-screen images after the instant scroll before the visual capture.
    await page.waitForTimeout(500);
    await page.screenshot({ path: `test-results/testimonials-page-${width}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

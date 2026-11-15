import { expect, test } from "@playwright/test";

test("mobile menu destinations are ready before opening the menu", async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const prefetched = new Set<string>();
  page.on("response", (response) => {
    // Manual full-route prefetches use the RSC header, without the optional
    // next-router-prefetch header used for partial/automatic prefetches.
    if (response.ok() && response.request().headers()["rsc"] === "1") {
      prefetched.add(new URL(response.url()).pathname.replace(/\.txt$/, ""));
    }
  });
  await page.goto("/contact");
  await expect.poll(() => prefetched.has("/about"), { timeout: 15_000 }).toBe(true);
  await page.waitForLoadState("networkidle");
  await expect(page.locator("[data-site-intro]")).toHaveCount(0);

  // The route must open from the client cache even if the network drops.
  await context.setOffline(true);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("navigation", { name: "Mobile", exact: true }).getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Builders in Ambattur.Built around you.");
  await expect(page.getByRole("dialog", { name: "Menu", exact: true })).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await context.setOffline(false);
});

test("desktop navigation preserves the document and browser back navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/about");
  await expect(page.locator("html")).toHaveAttribute("data-motion", /full|lite|reduced/);
  await page.evaluate(() => document.documentElement.setAttribute("data-navigation-marker", "preserved"));
  const documentRequests: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) documentRequests.push(request.url());
  });
  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("h1")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("#about-title")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-navigation-marker", "preserved");
  expect(documentRequests).toEqual([]);
});

test("About company content and photos remain visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto("http://127.0.0.1:3015/about");
    await expect(page.locator("#about-title")).toBeVisible();
    await expect(page.locator("[data-site-intro]")).not.toBeVisible();
    await expect(page.locator(".about-profile-years strong")).toHaveText("10+");
    await expect(page.locator(".about-page figure")).toHaveCount(1);
    for (const photo of await page.locator(".about-page figure img").all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((element) => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await expect(page.locator(".about-story-copy")).toContainText("Kallikuppam office");
    await expect(page.locator(".about-story-copy")).toContainText("Practical spaces");
    await expect(page.locator('main a[href="/testimonials"], main img[alt*="family"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Plan your home" })).toHaveAttribute("href", "/contact");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});

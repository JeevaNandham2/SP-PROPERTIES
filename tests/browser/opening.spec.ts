import { expect, test } from "@playwright/test";

test("the logo welcome finishes and does not replay on navigation or reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  const intro = page.locator("[data-site-intro]");
  await expect(intro).toBeVisible();
  await expect(intro.getByRole("button", { name: "Skip opening animation" })).toBeVisible();
  await expect.poll(() => intro.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(intro.locator("img")).toHaveAttribute("src", /logo-mark/);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(intro).toHaveCount(0, { timeout: 2500 });
  expect(await page.evaluate(() => sessionStorage.getItem("sp-opening-seen-v1"))).toBe("1");

  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(intro).toHaveCount(0);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(intro).not.toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const action of ["skip", "Escape", "wheel"] as const) {
  test(`visitors can dismiss the opening immediately with ${action}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/about", { waitUntil: "domcontentloaded" });
    const intro = page.locator("[data-site-intro][data-ready]");
    await expect(intro).toBeVisible();
    if (action === "skip") await intro.getByRole("button", { name: "Skip opening animation" }).click();
    else if (action === "Escape") await page.keyboard.press("Escape");
    else await page.mouse.wheel(0, 300);
    await expect(page.locator("[data-site-intro]")).toHaveCount(0, { timeout: 500 });
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("reduced-motion visitors see the page directly", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-site-intro]")).not.toBeVisible();
  await expect(page.locator("#about-title")).toBeVisible();
});

test("the opening clears even when the application JavaScript cannot load", async ({ page }) => {
  await page.route("**/_next/static/chunks/**", (route) => route.abort());
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  const intro = page.locator("[data-site-intro]");
  await expect(intro).toBeVisible();
  await expect(intro).not.toBeVisible({ timeout: 2500 });
  // CSS must reveal the page independently of React mounting or removing it.
  await expect(intro).toHaveCount(1);
  await expect(page.locator("#about-title")).toBeVisible();
});

test("unavailable session storage does not block the opening or page navigation", async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"] as const) {
      Storage.prototype[method] = () => { throw new DOMException("Storage unavailable", "SecurityError"); };
    }
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Skip opening animation" }).click();
  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("[data-site-intro]")).toHaveCount(0);
  expect(errors).toEqual([]);
});

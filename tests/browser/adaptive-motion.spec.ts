import { expect, test } from "@playwright/test";

test.describe("lower-powered touch devices", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 2, configurable: true });
      Object.defineProperty(navigator, "deviceMemory", { get: () => 2, configurable: true });
    });
  });

  test("6x CPU slowdown retains native scrolling, reveals and every location", async ({ page, context }) => {
    test.setTimeout(120_000);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/", "/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", "/projects/flats-in-annanur"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-motion", "lite");
      await expect(page.locator("html")).not.toHaveClass(/lenis/);
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 650 }] });
      for (const y of [570, 490, 410, 330, 250]) {
        await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y }] });
        await page.waitForTimeout(80);
      }
      await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await expect.poll(() => page.evaluate(() => scrollY), { message: path }).toBeGreaterThan(80);
      const pending = page.locator(".is-reveal-pending").first();
      if (await pending.count()) {
        const element = (await pending.elementHandle())!;
        await element.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
        await expect.poll(() => element.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    await page.goto("/");
    await expect(page.locator("#locations")).toHaveAttribute("data-static", "true");
    const next = page.getByRole("button", { name: "Next location", exact: true });
    const names = new Set<string>();
    for (let i = 0; i < 11; i++) {
      names.add((await page.locator(".fc--on h3").textContent())!);
      await expect(page.locator(".fc--on .fc__go")).toHaveAttribute("href", /^https:\/\/wa.me\//);
      if (i < 10) await next.click();
    }
    expect(names.size).toBe(11);
    await expect(next).toBeDisabled();
    await page.locator("#locations").screenshot({ path: "test-results/low-end-locations.png" });
    await page.getByRole("button", { name: "Family lounge", exact: true }).click();
    await expect(page.locator(".win__cap span")).toHaveText("Family lounge");
    await page.locator("#projects").screenshot({ path: "test-results/low-end-interiors.png" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(page.locator(".is-reveal-pending")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("automatic cards advance, pause for keyboard input and resume", async ({ page }) => {
    await page.goto("/projects");
    const rail = page.locator(".sp-preview-rail");
    await rail.scrollIntoViewIfNeeded();
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft), { timeout: 8000 }).toBeGreaterThan(100);
    await page.keyboard.press("Tab");
    await rail.focus();
    await rail.press("ArrowRight");
    await page.waitForTimeout(700);
    const position = await rail.evaluate((el) => el.scrollLeft);
    await page.waitForTimeout(4200);
    expect(await rail.evaluate((el) => el.scrollLeft)).toBeCloseTo(position, 0);
    await rail.evaluate((el) => (el as HTMLElement).blur());
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft), { timeout: 8000 }).toBeGreaterThan(position + 50);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(rail).not.toHaveClass(/is-auto-scrolling/);
  });
});

test("desktop easing sleeps when idle and wakes for wheel and anchor navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 8, configurable: true });
    Object.defineProperty(navigator, "deviceMemory", { get: () => 8, configurable: true });
    const state = window as typeof window & { animationFrames: number };
    state.animationFrames = 0;
    const raf = requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) => raf((time) => { state.animationFrames++; callback(time); });
  });
  await page.goto("/contact");
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page.waitForTimeout(1000);
  const count = () => page.evaluate(() => (window as typeof window & { animationFrames: number }).animationFrames);
  const before = await count();
  await page.waitForTimeout(650);
  expect(await count() - before).toBeLessThan(3);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(page.locator("html")).not.toHaveClass(/lenis-scrolling/);
  const after = await count();
  await page.waitForTimeout(650);
  expect(await count() - after).toBeLessThan(3);
  await page.getByRole("link", { name: "Start a conversation" }).click();
  await expect.poll(() => page.locator("#enquiry").evaluate((el) => Math.abs(el.getBoundingClientRect().top - 108))).toBeLessThan(3);
});

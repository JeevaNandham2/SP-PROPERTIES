import { expect, test } from "@playwright/test";
import { site } from "../../content/site";

for (const width of [320, 390, 768, 1440]) {
  test(`contact redesign is readable and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contact");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".contact-interest-options button")).toHaveCount(4);
    await expect(page.locator(".contact-channel").first()).toHaveAttribute("href", site.phoneHref);
    await expect(page.locator(".contact-channel").nth(1)).toHaveAttribute("href", new RegExp(`^https://wa.me/${site.whatsapp}`));
    await expect(page.locator(".contact-channel").last()).toHaveAttribute("href", `mailto:${site.email}`);
    await expect(page.getByRole("link", { name: "Get directions" })).toHaveAttribute("href", site.mapsUrl);
    await expect(page.locator("address").first()).toContainText(site.address.postalCode);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `test-results/contact-${width}.png`, fullPage: true });
  });
}

test("contact topics send the selected requirements to the WhatsApp handoff", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => { window.open = () => null; });
  await page.route("**/*", (route) => route.request().method() === "POST" ? route.abort() : route.continue());
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Enquiry form" });
  await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
  await expect(form.getByLabel("Full name")).toBeFocused();
  await expect(form.getByText("Please enter your name.")).toBeVisible();
  await expect(form.getByText("Please tick the box so we can contact you.")).toBeVisible();
  await form.getByLabel("Full name").fill("Test enquiry");
  await form.getByLabel("Mobile number").fill("+91 98765 43210");
  await form.getByLabel("Interested location").selectOption("Ambattur");
  await form.getByLabel("Configuration").selectOption("3 BHK");
  await form.getByRole("checkbox").check();
  for (const topic of ["Build a home", "Plan interiors", "Joint venture", "Buy a home"]) {
    await form.getByRole("button", { name: topic, exact: true }).click();
    await expect(form.getByRole("button", { name: topic, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(form.getByLabel("Interested location")).toBeVisible();
    await expect(form.getByLabel("Configuration")).toHaveCount(topic === "Buy a home" ? 1 : 0);
    await form.getByLabel("Message (optional)").fill("Please share the next steps.");
    await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
    const href = await form.getByRole("link", { name: "Open WhatsApp again" }).getAttribute("href");
    const message = new URL(href!).searchParams.get("text")!;
    expect(message).toContain(`Interested in: ${topic}`);
    expect(message).toContain("Location: Ambattur");
    expect(message).toContain("Mobile: 9876543210");
    expect(message).toContain(`Configuration: ${topic === "Buy a home" ? "3 BHK" : "Not applicable"}`);
    expect(message).toContain("Please share the next steps.");
  }
});

test("smooth wheel scrolling and reveal animations work across page templates", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 700 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", "/projects/flats-in-annanur"]) {
    await page.goto(path);
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await expect(page.locator("h1")).toHaveCSS("opacity", "1");
    await page.mouse.move(600, 450);
    await page.mouse.wheel(0, 420);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    await expect(page.locator("html")).not.toHaveClass(/lenis-scrolling/);
    const pending = page.locator("[data-reveal].is-reveal-pending").first();
    if (await pending.count()) {
      const incoming = (await pending.elementHandle())!;
      await incoming.evaluate((element) => element.scrollIntoView({ block: "center", behavior: "instant" }));
      await expect.poll(() => incoming.evaluate((element) => element.classList.contains("is-revealed"))).toBe(true);
      await expect.poll(() => incoming.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), { message: path }).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("anchors, route changes and reduced motion leave navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/contact");
  await page.getByRole("link", { name: "Start a conversation" }).click();
  await expect(page).toHaveURL(/#enquiry$/);
  await expect.poll(() => page.locator("#enquiry").evaluate((el) => Math.abs(el.getBoundingClientRect().top - 108))).toBeLessThan(3);
  const testimonialsLink = page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Testimonials" });
  await expect(testimonialsLink).toBeVisible();
  await expect(testimonialsLink).toBeInViewport();
  // The sticky navigation is already visible. Click its rendered position so
  // Playwright does not scroll it below the document's anchor scroll padding.
  const navigationBox = (await testimonialsLink.boundingBox())!;
  await page.mouse.click(navigationBox.x + navigationBox.width / 2, navigationBox.y + navigationBox.height / 2);
  await expect(page).toHaveURL(/\/testimonials$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  await page.getByRole("button", { name: "View photo of Balaji and family" }).click();
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(page.locator(".is-reveal-pending")).toHaveCount(0);
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveClass(/lenis/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await page.getByRole("button", { name: "Close menu", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
  await page.getByRole("button", { name: "Open chat", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/lenis-stopped/);
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);
});

test("landing and contact content stay visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3015/");
  await expect(page.locator(".intro__ph")).toHaveCSS("opacity", "1");
  await expect(page.locator(".intro__ph img")).toHaveCSS("clip-path", "none");
  await page.goto("http://127.0.0.1:3015/contact");
  await expect(page.locator(".contact-form-panel")).toBeVisible();
  await expect(page.locator(".contact-connect")).toHaveCSS("opacity", "1");
  await context.close();
});

import { expect, test } from "@playwright/test";
import { projects } from "../../content/projects";

for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`homepage and scroll scenes work at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(page.locator(".hero-buttons a")).toHaveCount(2);
    for (const image of [".header-brand img", ".hero-background img"]) {
      await expect.poll(() => page.locator(image).evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.locator(".deck__track").evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 76));
    await expect(page.locator(".fc--on h3")).toContainText("Ambattur");
    await page.locator(".deck__track").evaluate((el) => {
      const track = el as HTMLElement;
      const header = innerWidth < 768 ? 70 : 76;
      const sceneHeight = track.querySelector(".deck__stick")!.clientHeight;
      scrollTo({ top: track.getBoundingClientRect().top + scrollY - header + (track.offsetHeight - sceneHeight) / 10 + 2, behavior: "instant" });
    });
    await expect(page.locator(".fc--on h3")).toHaveText("Anna Nagar");
    await page.locator(".feat__track").evaluate((el) => {
      const track = el as HTMLElement;
      scrollTo({ top: track.getBoundingClientRect().top + scrollY + (track.offsetHeight - innerHeight) * 0.6, behavior: "instant" });
    });
    await expect(page.locator(".win__cap span")).toHaveText("Dining");
    await expect.poll(() => page.locator(".win__vp img.on").evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({ path: `test-results/featured-${viewport.width}.png` });
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: `test-results/home-${viewport.width}.png` });
    expect(errors).toEqual([]);
  });
}

test("mobile menu unlocks page scrolling after a desktop resize", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu", exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("dialog", { name: "Menu", exact: true })).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("service links navigate and same-page mobile contact link closes the menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog", { name: "Menu", exact: true }).getByRole("link", { name: "Book a site visit" }).click();
  await expect(page.getByRole("dialog", { name: "Menu", exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Services", exact: true }).click();
  await page.locator("#desktop-services").getByRole("link", { name: /Interior services/i }).click();
  await expect(page).toHaveURL(/\/services#interior-services$/);
  await expect(page.locator("#interior-services")).toBeVisible();
});

test("chat recovers from bad storage and restart cancels delayed replies", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("sp-chat-v2", '{"msgs":null}'));
  await page.goto("/");
  await page.getByRole("button", { name: "Open chat" }).click();
  const dialog = page.getByRole("dialog", { name: "Chat with SP Properties" });
  await expect(dialog.getByRole("log")).toContainText("Welcome to SP Properties");
  await dialog.getByRole("button", { name: "Apartments", exact: true }).click();
  await dialog.getByRole("button", { name: "Restart chat" }).click();
  await page.waitForTimeout(500); // Delayed bot replies arrive after 350ms.
  await expect(dialog.getByRole("log").locator("p")).toHaveCount(1);
  await dialog.getByLabel("Type your question").fill("Anna Nagar");
  await dialog.getByRole("button", { name: "Send", exact: true }).click();
  await expect(dialog.getByRole("log")).toContainText("flats in Anna Nagar");
  await expect(dialog.getByRole("link", { name: "Contact on WhatsApp", exact: true }).last()).toHaveAttribute("href", /Anna%20Nagar/);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open chat" })).toBeFocused();
});

test("contact form validates and keeps a WhatsApp fallback without sending", async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Enquiry form" });
  await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
  await expect(form.getByText("Please enter your name.")).toBeVisible();
  await form.getByLabel("Full name").fill("Test enquiry");
  await form.getByLabel("Mobile number").fill("+91 98765 43210");
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
  await expect(form.getByRole("link", { name: "Open WhatsApp again" })).toHaveAttribute("href", /Mobile%3A%209876543210/);
});

test("reduced-motion mode still exposes all locations and interiors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#locations")).toHaveAttribute("data-static", "true");
  await page.locator(".fan").press("ArrowRight");
  await expect(page.locator(".fc--on h3")).toHaveText("Anna Nagar");
  await page.getByRole("button", { name: "Family lounge", exact: true }).click();
  await expect(page.locator(".win__cap span")).toHaveText("Family lounge");
});

test("all exported pages, metadata and Netlify image sources respond", async ({ request }) => {
  for (const path of ["/", "/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", "/robots.txt", "/sitemap.xml", ...projects.map((p) => `/projects/${p.slug}`)]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  expect((await request.get("/projects/not-a-project")).status()).toBe(404);
  expect((await request.get("/.netlify/images?url=%2Fimages%2Fprojects%2Fambattur-flats.webp&w=640&q=90&fm=webp")).status()).toBe(200);
});

test("secondary pages stay within a narrow mobile viewport without content placeholders", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", "/projects/flats-in-ambattur"]) {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), { message: path }).toBe(true);
    await expect(page.locator("main")).not.toContainText(/\[(?:Project name|Area|Status|RERA No\.|CMDA approval|Office hours)/);
  }
  expect(errors).toEqual([]);
});

test("landing enquiry retains a usable link if the WhatsApp popup is blocked", async ({ page }) => {
  await page.addInitScript(() => { window.open = () => null; });
  await page.goto("/");
  const form = page.locator("#contact form");
  await form.getByLabel("Full Name").fill("Test enquiry");
  await form.getByLabel("Phone Number").fill("9876543210");
  await form.getByLabel("Property Interest").selectOption("3 BHK Flats");
  await form.getByRole("button", { name: "Send Enquiry", exact: true }).click();
  await expect(form.getByRole("link", { name: "Open WhatsApp and press Send" })).toHaveAttribute("href", /3%20BHK%20Flats/);
});

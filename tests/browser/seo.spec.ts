import { expect, test } from "@playwright/test";
import { projects } from "../../content/projects";
import { site } from "../../content/site";

const pages = ["/", "/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", ...projects.map((p) => `/projects/${p.slug}`)];

test("all 18 public pages have unique SEO metadata and working crawlable links", async ({ page, request }) => {
  test.setTimeout(120_000);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const destinations = new Map<string, Set<string>>();
  const internalLinks: { source: string; path: string; hash: string }[] = [];
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml.match(/<loc>/g)).toHaveLength(pages.length);
  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1"), path).toHaveCount(1);
    await expect(page.locator('meta[name="description"]'), path).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveCount(1);
    const title = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content"))!;
    expect(title, path).toContain("SP Properties");
    if (!path.startsWith("/projects/")) expect(title, path).toContain("Ambattur");
    expect(description, path).toContain("Ambattur");
    expect(title, path).not.toMatch(/\bChennai\b|\bhomes\b/i);
    await expect(page.locator("main"), path).not.toContainText(/\bhomes\b/i);
    await expect(page.locator("footer"), path).not.toContainText(/\bhomes\b/i);
    await expect(page.locator("main"), path).not.toContainText(/\bChennai\b/i, { useInnerText: true });
    await expect(page.locator("footer"), path).not.toContainText(/\bChennai\b/i, { useInnerText: true });
    expect(description.length, path).toBeGreaterThan(50);
    expect(titles.has(title), `Duplicate title on ${path}`).toBe(false);
    expect(descriptions.has(description), `Duplicate description on ${path}`).toBe(false);
    titles.add(title); descriptions.add(description);
    const canonical = (await page.locator('link[rel="canonical"]').getAttribute("href"))!;
    expect(canonical.replace(/\/$/, ""), path).toBe(`${site.url}${path}`.replace(/\/$/, ""));
    expect(xml, path).toContain(`<loc>${site.url}${path === "/" ? "" : path}</loc>`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${site.url}/opengraph-image`);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", "SP Properties — Flats and construction in Ambattur");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
    const robotsContent = await page.locator('meta[name="robots"]').evaluateAll((els) => els.map((el) => el.getAttribute("content") || "").join(" "));
    expect(robotsContent).not.toContain("noindex");
    await expect(page.locator("main img:not([alt])"), path).toHaveCount(0);
    await expect(page.locator("main"), path).not.toContainText(/\[(?:Nearby|Project name|Area|Status|RERA No\.|CMDA approval|Office hours)/);
    const schema = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((el) => JSON.parse(el.textContent || "{}")));
    const types = schema.flatMap((item) => item["@type"]);
    expect(types, path).toContain("WebSite");
    expect(types, path).toContain("GeneralContractor");
    expect(types.some((type) => ["WebPage", "AboutPage", "ContactPage", "CollectionPage"].includes(type)), path).toBe(true);
    if (path !== "/") expect(types, path).toContain("BreadcrumbList");
    expect(types, path).not.toContain("Residence");
    expect(types, path).not.toContain("Review");
    const snapshot = await page.evaluate(() => ({
      ids: Array.from(document.querySelectorAll("[id]")).map((el) => el.id),
      links: Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).map((a) => a.getAttribute("href")!).filter((href) => href.startsWith("/") || href.startsWith("#")),
    }));
    destinations.set(path, new Set(snapshot.ids));
    for (const href of snapshot.links) {
      const url = new URL(href, `${site.url}${path}`);
      internalLinks.push({ source: path, path: url.pathname, hash: decodeURIComponent(url.hash.slice(1)) });
    }
  }
  for (const link of internalLinks) {
    expect(destinations.has(link.path), `${link.source} links to missing page ${link.path}`).toBe(true);
    if (link.hash) expect(destinations.get(link.path)?.has(link.hash), `${link.source} has broken anchor ${link.path}#${link.hash}`).toBe(true);
  }
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(`Sitemap: ${site.url}/sitemap.xml`);
  const image = await request.get("/opengraph-image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).length).toBeGreaterThan(1000);
});

for (const width of [320, 390, 1440]) {
  test(`concise secondary pages remain readable at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/about", "/services", "/testimonials", "/contact", "/ambattur", "/projects", "/projects/flats-in-thirumullaivoyal"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), { message: path }).toBe(true);
      const paragraphs = await page.locator("main p").allTextContents();
      expect(Math.max(...paragraphs.map((p) => p.trim().split(/\s+/).length)), `Long paragraph on ${path}`).toBeLessThan(55);
      for (const image of await page.locator("main img, footer img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((el) => (el as HTMLImageElement).naturalWidth), { message: `Image on ${path}` }).toBeGreaterThan(0);
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.screenshot({ path: `test-results/seo-${path.replaceAll("/", "-")}-${width}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

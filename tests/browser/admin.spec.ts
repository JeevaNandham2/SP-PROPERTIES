import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import seed from "../../content/projects.seed.json";
import type { CmsProject, CmsState } from "../../lib/cms/model";

async function mockEditor(page: Page) {
  const document = { revision: "seed", updatedAt: null as string | null, projects: structuredClone(seed) as CmsProject[] };
  const state = { schemaVersion: 1, draft: document, published: structuredClone(document), email: "editor@example.com", canPublish: true, lastPublish: undefined as CmsState["lastPublish"] };
  let live = "seed";
  let queued = "";
  let saves = 0;
  const upload = await readFile("public/images/projects/ambattur-flats.webp");
  await page.route("**/.netlify/functions/project-admin**", async route => {
    const request = route.request(); const action = new URL(request.url()).searchParams.get("action");
    if (action === "upload") return route.fulfill({ json: { src: `/images/managed/${"a".repeat(64)}.webp`, width: 1200, height: 1600, bytes: upload.length } });
    if (action === "image") return route.fulfill({ body: upload, contentType: "image/webp" });
    if (action === "publish") { queued = request.postDataJSON().revision; state.published = structuredClone(state.draft); state.lastPublish = { revision: queued, requestedAt: new Date().toISOString(), status: "queued" }; return route.fulfill({ status: 202, json: { revision: queued, status: "queued" } }); }
    if (request.method() === "PUT") {
      const data = request.postDataJSON();
      expect(data.baseRevision).toBe(state.draft.revision);
      state.draft = { revision: `saved-${++saves}`, updatedAt: new Date().toISOString(), projects: data.projects };
    }
    return route.fulfill({ json: state });
  });
  await page.route("**/content-version.json?**", route => route.fulfill({ json: { revision: live } }));
  return { state, finishPublish: () => { live = queued; }, upload };
}

test("private editor requires sign-in and has no public signup form", async ({ page }) => {
  await page.route("**/.netlify/functions/project-admin**", route => route.fulfill({ status: 401, json: { error: "Sign in to manage projects." } }));
  await page.goto("/admin/");
  await expect(page.getByRole("heading", { name: "Manage your projects" })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Add project", exact: false })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /sign up/i })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
});

for (const width of [360, 1440]) {
  test(`React editor updates content, uploads images and publishes explicitly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 980 });
    const fixture = await mockEditor(page);
    await page.goto("/admin/");
    await expect(page.getByRole("heading", { name: "Ambattur", exact: true, level: 1 })).toBeVisible();
    await expect(page.getByLabel("Location", { exact: true })).toHaveAttribute("readonly", "");
    await expect(page.getByLabel("Page address")).toHaveAttribute("readonly", "");
    await page.getByLabel("Project / card title").fill("SP Ambattur Gardens");
    await page.getByLabel("Project description").fill("Bright homes with spacious balconies and covered parking.");
    await expect(page.getByLabel("Live card preview")).toContainText("SP Ambattur Gardens");
    await expect(page.getByLabel("Live card preview")).toContainText("Bright homes with spacious balconies and covered parking.");
    await page.getByLabel("Replace image 1", { exact: true }).setInputFiles({ name: "project.webp", mimeType: "image/webp", buffer: fixture.upload });
    await expect(page.getByRole("status").filter({ hasText: "Image uploaded and optimized" })).toBeVisible();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();
    expect(fixture.state.draft.projects[0].name).toBe("SP Ambattur Gardens");
    expect(fixture.state.published.projects[0]).not.toHaveProperty("name");
    await page.getByRole("button", { name: "Publish changes", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Publish requested" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publish changes" })).toBeDisabled();
    await page.reload();
    await expect(page.getByRole("status").filter({ hasText: "Waiting for the new website build" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publish changes" })).toBeDisabled();
    fixture.finishPublish();
    await expect(page.getByRole("status").filter({ hasText: "are now live" })).toBeVisible({ timeout: 15_000 });
    await page.screenshot({ path: `test-results/admin-editor-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const image = page.getByLabel("Live card preview").locator("article > img");
    await expect(image).toHaveCSS("object-fit", "contain");
    expect(await image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  });
}

test("admin adds a new card and reloads its saved content without altering indexed page addresses", async ({ page }) => {
  const fixture = await mockEditor(page);
  await page.goto("/admin/");
  await page.getByRole("complementary", { name: "Project list", exact: true }).getByRole("button", { name: "Add project", exact: false }).click();
  await page.getByLabel("Location", { exact: true }).fill("Pudur");
  await page.getByLabel("Project / card title").fill("SP Green Court");
  await expect(page.getByLabel("Page address")).toHaveValue("/projects/flats-in-pudur");
  await page.getByLabel("Add project image").setInputFiles({ name: "pudur.webp", mimeType: "image/webp", buffer: fixture.upload });
  await expect(page.getByRole("button", { name: "Save draft", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();
  expect(fixture.state.draft.projects.length).toBe(12);
  expect(fixture.state.draft.projects.slice(0, 11).map(project => project.slug)).toEqual(seed.map(project => project.slug));
  await page.reload();
  await page.getByRole("navigation", { name: "Choose project" }).getByRole("button", { name: /SP Green Court/ }).click();
  await expect(page.getByLabel("Project / card title")).toHaveValue("SP Green Court");
});

test("public project content is exported without JavaScript, and admin scripts stay off public pages", async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3015/projects");
  await expect(page.locator(".sp-preview-card")).toHaveCount(11);
  expect(await page.locator(".sp-preview-card h3").allTextContents()).toEqual(seed.map(project => project.location));
  const source = await (await request.get("/projects")).text();
  expect(source).not.toContain("/admin/admin-");
  expect(source).not.toContain("netlify/identity");
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/admin");
  await context.close();
});

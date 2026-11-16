import { expect, test } from "@playwright/test";
import { projects } from "../../content/projects";

test("every project gallery image is exported and belongs to its location page", async ({ page, request }) => {
  for (const project of projects.filter((p) => p.gallery?.length)) {
    await page.goto(`/projects/${project.slug}`);
    const gallery = page.getByRole("region", { name: `${project.location} flat gallery` });
    const images = project.gallery!;
    await expect(gallery.locator("figure img")).toHaveAttribute("alt", images[0].alt);
    await expect.poll(() => gallery.locator("figure img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(gallery.getByRole("button")).toHaveCount(images.length > 1 ? images.length : 0);
    await expect(page.getByRole("form", { name: "Enquiry form" }).getByRole("combobox")).toHaveCount(0);
    await expect(page.getByRole("form", { name: "Enquiry form" }).locator("textarea")).toHaveCount(0);
    const flatType = page.getByRole("radiogroup", { name: "Flat type *", exact: true });
    await expect(flatType.getByRole("radio")).toHaveCount(2);
    await expect(flatType.getByRole("radio", { name: "2 BHK", exact: true })).not.toBeChecked();
    await expect(flatType.getByRole("radio", { name: "3 BHK", exact: true })).not.toBeChecked();
    await expect(page.getByRole("rowheader", { name: "Flat sizes", exact: true })).toHaveCount(0);
    await expect(page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Location", exact: true }) }).getByRole("cell")).toHaveText(project.location);
    for (const image of images) {
      expect(image.alt).toContain(project.location);
      const response = await request.get(image.src);
      expect(response.status(), image.src).toBe(200);
      expect(response.headers()["content-type"]).toContain(image.src.endsWith(".svg") ? "image/svg+xml" : "image/webp");
    }
  }
});

for (const width of [390, 1440]) {
  test(`one flat filter controls the map and cards at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects?bhk=2");
    const filter = page.getByRole("group", { name: "Flat configuration", exact: true });
    await expect(filter).toHaveCount(1);
    await expect(filter.getByRole("button")).toHaveCount(3);
    for (const bhk of ["2", "3", "all"]) {
      const name = bhk === "all" ? "All flats" : `${bhk} BHK`;
      await filter.getByRole("button", { name, exact: true }).click();
      await expect(filter.getByRole("button", { name, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(filter.locator('[aria-pressed="true"]')).toHaveCount(1);
      const expected = projects.filter((p) => bhk === "all" || p.configurations.some((c) => String(c.bhk) === bhk));
      await expect(page.locator(".sp-animated-pin")).toHaveCount(expected.length);
      await expect(page.locator(".sp-preview-card")).toHaveCount(expected.length);
      await expect(page.locator(".sp-preview-card h3")).toHaveText(expected.map((p) => p.location));
      await expect(page.locator(".sp-toolbar-count")).toHaveText(`${expected.length} locations`);
    }
    await page.screenshot({ path: `test-results/project-filter-${width}.png` });
    await page.goto("/projects?bhk=invalid");
    await expect(filter.getByRole("button", { name: "All flats", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".sp-preview-card")).toHaveCount(projects.length);
  });

  test(`single-image projects and the supplied Kolathur image work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/flats-in-ambattur");
    const gallery = page.getByRole("region", { name: "Ambattur flat gallery" });
    await expect(gallery.getByRole("group", { name: "Choose a gallery image" })).toHaveCount(0);
    await expect(gallery.locator("figcaption")).toContainText("Flat exterior rendering");
    await expect(gallery.locator("figure img")).toHaveAttribute("alt", /SP Properties flat exterior rendering in Ambattur/);
    await expect(gallery.locator("figure img")).toHaveCSS("object-fit", "contain");
    await expect.poll(() => gallery.locator("figure img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(gallery).toContainText("SP Properties architectural rendering");
    await expect(page.getByLabel("Interested location")).toHaveCount(0);
    await expect(page.getByLabel("Configuration", { exact: true })).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await gallery.screenshot({ path: `test-results/project-gallery-${width}.png` });
    await page.goto("/projects/flats-in-kolathur");
    const kolathur = page.getByRole("region", { name: "Kolathur flat gallery" });
    await expect(kolathur.locator("figure img")).toHaveAttribute("alt", /flat exterior rendering in Kolathur/);
    await expect(kolathur.locator("figure img")).toHaveAttribute("src", /kolathur-flats/);
    await expect(kolathur.locator("figure img")).toHaveCSS("object-fit", "contain");
    await expect(kolathur).toContainText("SP Properties architectural rendering");
    await expect.poll(() => kolathur.locator("figure img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await kolathur.screenshot({ path: `test-results/kolathur-gallery-${width}.png` });
    await page.getByRole("form", { name: "Enquiry form" }).screenshot({ path: `test-results/project-enquiry-${width}.png` });
    await page.getByRole("table", { name: "Project location and details in Kolathur" }).locator("..").screenshot({ path: `test-results/project-details-${width}.png` });
  });

  test(`supplied Thirumullaivoyal renderings appear in the gallery and previews at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/flats-in-thirumullaivoyal");
    const gallery = page.getByRole("region", { name: "Thirumullaivoyal flat gallery" });
    await expect(gallery.getByRole("button")).toHaveCount(2);
    await expect(gallery.locator("figure img")).toHaveAttribute("alt", /SP Properties flat exterior rendering in Thirumullaivoyal/);
    await gallery.getByRole("button", { name: "View anna street exterior rendering" }).click();
    await expect(gallery.locator("figure img")).toHaveAttribute("alt", /Anna Street apartment rendering/);
    await page.keyboard.press("Shift+Tab");
    await expect(gallery.getByRole("button", { name: "View flat exterior rendering" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(gallery.locator("figure img")).toHaveAttribute("alt", /flat exterior rendering in Thirumullaivoyal/);
    await expect(gallery.locator('[aria-pressed="true"]')).toHaveCount(1);
    await gallery.getByRole("button", { name: "View anna street exterior rendering" }).click();
    await expect(gallery).toContainText("SP Properties architectural rendering");
    await expect(gallery).not.toContainText("project photograph");
    await expect.poll(() => gallery.locator("figure img").evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await gallery.screenshot({ path: `test-results/supplied-project-gallery-${width}.png` });
    for (const file of ["thirumullaivoyal-flats.webp", "thirumullaivoyal-anna-street.webp"]) {
      const response = await request.get(`/images/projects/${file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/webp");
    }
    await page.goto("/projects");
    const card = page.locator(".sp-preview-card").filter({ has: page.getByRole("heading", { name: "Thirumullaivoyal", exact: true }) });
    await expect(card.locator("img")).toHaveAttribute("alt", /SP Properties flat exterior rendering/);
    await expect(card).toContainText("Project rendering");
    await page.goto("/");
    await page.locator(".fan").focus();
    for (let index = 0; index < 3; index++) await page.keyboard.press("ArrowRight");
    await expect(page.locator(".fc--on h3")).toHaveText("Thirumullaivoyal");
    await expect(page.locator(".fc--on img")).toHaveAttribute("alt", /SP Properties flat exterior rendering/);
  });
}

for (const width of [320, 1440]) {
  test(`project enquiries send the chosen flat type and current location at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => { window.open = () => null; });
    await page.route("**/*", route => route.request().method() === "POST" ? route.abort() : route.continue());
    await page.goto("/projects/flats-in-kolathur");
    const form = page.getByRole("form", { name: "Enquiry form" });
    await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
    await expect(form.getByText("Please enter your name.")).toBeVisible();
    await expect(form.getByText("Please tick the box so we can contact you.")).toBeVisible();
    await expect(form.getByText("Please choose 2 BHK or 3 BHK.")).toBeVisible();
    for (const location of ["Kolathur", "Perambur"]) {
      if (location === "Perambur") {
        await page.getByRole("link", { name: "View details for Perambur", exact: true }).click();
        await expect(page).toHaveURL(/\/projects\/flats-in-perambur$/);
        await expect(form.getByRole("link", { name: "Open WhatsApp again" })).toHaveCount(0);
      }
      await expect(form.getByRole("combobox")).toHaveCount(0);
      await expect(form.getByLabel("Message (optional)")).toHaveCount(0);
      await expect(form.getByRole("radio", { checked: true })).toHaveCount(0);
      await form.getByLabel("Full name").fill("Test enquiry");
      await form.getByLabel("Mobile number").fill("9876543210");
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
      await expect(form.getByText("Please choose 2 BHK or 3 BHK.")).toBeVisible();
      await expect(form.getByRole("link", { name: "Open WhatsApp again" })).toHaveCount(0);
      for (const flatType of ["2 BHK", "3 BHK"]) {
        if (flatType === "2 BHK") {
          await form.getByRole("radio", { name: flatType, exact: true }).check();
        } else {
          await form.getByRole("radio", { name: "2 BHK", exact: true }).focus();
          await page.keyboard.press("ArrowRight");
        }
        await expect(form.getByRole("radio", { name: flatType, exact: true })).toBeChecked();
        await expect(form.getByRole("radio", { checked: true })).toHaveCount(1);
        await expect(form.getByText("Please choose 2 BHK or 3 BHK.")).toHaveCount(0);
        await expect(form.getByRole("link", { name: "Open WhatsApp again" })).toHaveCount(0);
        if (location === "Kolathur" && flatType === "3 BHK") {
          await form.screenshot({ path: `test-results/project-flat-type-${width}.png` });
        }
        await form.getByRole("button", { name: "Send enquiry on WhatsApp" }).click();
        const href = await form.getByRole("link", { name: "Open WhatsApp again" }).getAttribute("href");
        const message = new URL(href!).searchParams.get("text")!;
        expect(message).toContain(`Location: ${location}`);
        expect(message).toContain(`Source: Project page \u2014 ${location}`);
        expect(message).toContain(`Configuration: ${flatType}`);
        expect(message).not.toContain("Not specified");
        expect(message).toContain("Message: -");
        if (location === "Perambur") expect(message).not.toContain("Kolathur");
      }
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  });
}

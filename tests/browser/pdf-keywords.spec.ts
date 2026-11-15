import { expect, test } from "@playwright/test";

test("PDF keywords match relevant pages, and FAQ schema matches visible answers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#properties")).toContainText("2 BHK flats in Ambattur");
  await expect(page.locator("#properties")).toContainText("3 BHK flats in Ambattur");
  await expect(page.locator("#home-hero-title")).toHaveText("A place to live.A space to belong.");
  await page.goto("/about");
  await expect(page.locator("#about-story")).toContainText("real estate company in Ambattur");
  await page.goto("/projects");
  await expect(page.locator(".sp-promo-copy")).toContainText("new apartments in Chennai");
  await page.goto("/services");
  await expect(page.locator("#building-contractor")).toContainText("Villa construction in Chennai");
  await page.getByRole("button", { name: "What is the villa construction cost per sq ft in Chennai?" }).click();
  await expect(page.getByText("The estimate depends on your plot", { exact: false })).toBeVisible();
  await page.goto("/ambattur");
  await expect(page).toHaveTitle("Apartments for Sale in Ambattur | SP Properties");
  await expect(page.locator("h1")).toContainText("Apartments for sale in Ambattur.");
  const faq = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => JSON.parse(node.textContent!)).find((value) => value["@type"] === "FAQPage"));
  for (const entry of faq.mainEntity) {
    await page.getByRole("button", { name: entry.name, exact: true }).click();
    await expect(page.getByText(entry.acceptedAnswer.text, { exact: true })).toBeVisible();
  }
  await expect(page.locator("main")).not.toContainText(/no brokerage|1 BHK|under 50 lakhs|RERA approved flats/i);
});

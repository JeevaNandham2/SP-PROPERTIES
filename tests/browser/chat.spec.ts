import { expect, test } from "@playwright/test";
import { FALLBACK } from "../../content/chatbot";

for (const width of [390, 1440]) {
  test(`assistant provides one unrelated-question handoff at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat" }).click();
    const dialog = page.getByRole("dialog", { name: "Chat with SP Properties" });
    await expect(dialog).toContainText("Property & construction assistant");
    await dialog.getByLabel("Type your question").fill("2 BHK in Ambattur");
    await dialog.getByRole("button", { name: "Send", exact: true }).click();
    await expect(dialog.locator('[data-sender="bot"]').last()).toContainText("2 BHK flats in Ambattur");
    await dialog.getByLabel("Type your question").fill("What is the weather in Anna Nagar?");
    await dialog.getByRole("button", { name: "Send", exact: true }).click();
    const last = dialog.locator('[data-sender="bot"]').last();
    await expect(last.locator("p")).toHaveText(FALLBACK);
    await expect(last.getByRole("link")).toHaveCount(1);
    const contact = last.getByRole("link", { name: "Contact on WhatsApp", exact: true });
    const url = new URL((await contact.getAttribute("href"))!);
    expect(url.origin).toBe("https://wa.me");
    expect(url.searchParams.get("text")).toContain("Location: Ambattur");
    expect(url.searchParams.get("text")).toContain("Configuration: 2 BHK");
    await expect(last.getByRole("button")).toHaveCount(0);
    await expect(dialog.getByRole("group", { name: "Suggested replies" })).toHaveCount(0);
    await expect(dialog.getByRole("form", { name: "Leave your details" })).toHaveCount(0);
    const bounds = await dialog.boundingBox();
    expect(bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.height).toBeLessThanOrEqual(844);
    await page.screenshot({ path: `test-results/chat-handoff-${width}.png` });
  });
}

test("assistant retains a relevant enquiry across follow-ups and reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open chat" }).click();
  let dialog = page.getByRole("dialog", { name: "Chat with SP Properties" });
  await dialog.getByLabel("Type your question").fill("3 BHK in Anna Nagar");
  await dialog.getByRole("button", { name: "Send", exact: true }).click();
  await expect(dialog.locator('[data-sender="bot"]').last()).toContainText("3 BHK flats in Anna Nagar");
  await page.reload();
  await page.getByRole("button", { name: "Open chat" }).click();
  dialog = page.getByRole("dialog", { name: "Chat with SP Properties" });
  await dialog.getByLabel("Type your question").fill("Please share floor plans");
  await dialog.getByRole("button", { name: "Send", exact: true }).click();
  const last = dialog.locator('[data-sender="bot"]').last();
  await expect(last).toContainText("3 BHK brochure, floor plans and size details for Anna Nagar");
  await expect(last.getByRole("link", { name: "Contact on WhatsApp" })).toHaveAttribute("href", /Anna%20Nagar/);
});

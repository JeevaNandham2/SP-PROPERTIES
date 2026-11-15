import { site } from "@/content/site";

/** Builds a wa.me link with a prefilled message to the SP Properties enquiry number. */
export function waLink(message: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type Enquiry = {
  name: string;
  mobile: string;
  location: string;
  bhk: string;
  message?: string;
  source: string;
};

/** Formats an enquiry exactly as the client asked: form → WhatsApp. */
export function enquiryMessage(e: Enquiry): string {
  return [
    "New enquiry — SP Properties website",
    `Name: ${e.name}`,
    `Mobile: ${e.mobile}`,
    `Location: ${e.location}`,
    `Configuration: ${e.bhk}`,
    `Message: ${e.message?.trim() || "-"}`,
    `Source: ${e.source}`,
  ].join("\n");
}

/** Optional: also send a copy to a webhook / email service if configured. */
export async function forwardEnquiry(e: Enquiry): Promise<void> {
  const url = process.env.NEXT_PUBLIC_ENQUIRY_WEBHOOK;
  if (!url) return;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) });
  } catch {
    /* WhatsApp remains the primary channel; ignore webhook failures */
  }
}

/** Fires an analytics event if GA4 is loaded. */
export function track(event: string, params: Record<string, string> = {}): void {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.("event", event, params);
}

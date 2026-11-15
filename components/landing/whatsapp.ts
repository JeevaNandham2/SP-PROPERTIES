import { waLink } from "@/lib/whatsapp";
import type { EnquiryValues } from "./validation";

export const whatsappLink = waLink;

export function enquiryText(enquiry: EnquiryValues) {
  return [
    "Hi SP Properties, I'd like to enquire.",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    enquiry.email ? `Email: ${enquiry.email}` : null,
    `Interested in: ${enquiry.interest}`,
    enquiry.message?.trim() ? `Message: ${enquiry.message.trim()}` : null,
  ].filter(Boolean).join("\n");
}

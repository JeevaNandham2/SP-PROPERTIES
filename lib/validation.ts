import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Please keep your name under 80 characters."),
  mobile: z
    .string()
    .transform((v) => v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))
    .refine((v) => /^[6-9]\d{9}$/.test(v), "Please enter a valid 10-digit mobile number."),
  location: z.string().min(1),
  bhk: z.string().min(1),
  message: z.string().max(600, "Please keep the message under 600 characters.").optional(),
  consent: z.literal(true, { error: "Please tick the box so we can contact you." }),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryOutput = z.output<typeof enquirySchema>;

import { z } from "zod";
import { enquirySchema as currentSchema } from "@/lib/validation";
import { interestOptions } from "./data/content";

export const enquirySchema = z.object({
  name: currentSchema.shape.name.max(80, "Name is too long."),
  phone: currentSchema.shape.mobile,
  email: z.string().trim().optional().refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Please check this email address."),
  interest: z.enum(interestOptions, { error: "Please choose an option." }),
  message: currentSchema.shape.message,
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

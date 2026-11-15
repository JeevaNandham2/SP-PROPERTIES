import assert from "node:assert/strict";
import test from "node:test";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema } from "../lib/validation";
import { enquirySchema as landingSchema } from "../components/landing/validation";

const valid = { name: "  Priya  ", mobile: "+91 98765 43210", location: "Ambattur", bhk: "2 BHK", consent: true as const };

test("enquiries trim names and normalize Indian phone numbers", () => {
  const result = enquirySchema.parse(valid);
  assert.equal(result.name, "Priya");
  assert.equal(result.mobile, "9876543210");
  assert.equal(enquirySchema.parse({ ...valid, mobile: "9876543210" }).mobile, "9876543210");
});

test("invalid name, phone, consent and long messages cannot be submitted", () => {
  for (const change of [{ name: " " }, { name: "A".repeat(81) }, { mobile: "1234567890" }, { mobile: "98765" }, { consent: false }, { message: "a".repeat(601) }]) {
    assert.equal(enquirySchema.safeParse({ ...valid, ...change }).success, false);
  }
});

test("landing form permits empty email but rejects invalid email and interests", () => {
  const data = { name: "Priya", phone: valid.mobile, interest: "Premium Apartments" };
  assert.ok(landingSchema.safeParse(data).success);
  assert.ok(landingSchema.safeParse({ ...data, email: "" }).success);
  assert.equal(landingSchema.safeParse({ ...data, email: "invalid" }).success, false);
  assert.equal(landingSchema.safeParse({ ...data, interest: "" }).success, false);
});

test("React Hook Form receives field errors and normalized data from Zod", async () => {
  const resolver = zodResolver(enquirySchema);
  const options = { fields: {}, shouldUseNativeValidation: false };
  const invalid = await resolver({ ...valid, mobile: "123", consent: false as unknown as true }, undefined, options);
  assert.ok(invalid.errors.mobile?.message);
  assert.match(invalid.errors.consent?.message ?? "", /tick the box/);
  const accepted = await resolver(valid, undefined, options);
  assert.deepEqual(accepted.errors, {});
  assert.equal(accepted.values.mobile, "9876543210");
});

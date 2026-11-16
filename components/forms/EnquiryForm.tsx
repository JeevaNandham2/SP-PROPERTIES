"use client";

import { useId, useState } from "react";
import { ArrowUpRight, House, HardHat, Paintbrush, Handshake } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enquirySchema, projectEnquirySchema, type EnquiryInput, type EnquiryOutput } from "@/lib/validation";
import { enquiryMessage, forwardEnquiry, track, waLink } from "@/lib/whatsapp";
import { locations } from "@/content/projects";
import { site } from "@/content/site";
import { btn } from "@/components/ui/Button";

const field = "enquiry-field min-h-[52px] rounded-card border border-line bg-white px-3.5 text-base text-navy aria-[invalid=true]:border-error";
const label = "enquiry-label flex flex-col gap-2 text-[13px] font-semibold tracking-[0.06em] text-navy";
const interests = [
  { label: "Buy a flat", icon: House, placeholder: "Your budget, preferred visit day or questions" },
  { label: "Build a home", icon: HardHat, placeholder: "Your plot, location and building plans" },
  { label: "Plan interiors", icon: Paintbrush, placeholder: "Your rooms, style and budget" },
  { label: "Joint venture", icon: Handshake, placeholder: "Your land, location and development plans" },
] as const;

export function EnquiryForm({ defaultLocation, source, variant = "default" }: { defaultLocation?: string; source: string; variant?: "default" | "contact" | "project" }) {
  const [link, setLink] = useState<string | null>(null);
  const [interest, setInterest] = useState(0);
  const isContact = variant === "contact";
  const isProject = variant === "project";
  const homeEnquiry = !isContact || interest === 0;
  const errorId = useId();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, EnquiryOutput>({
    resolver: zodResolver(isProject ? projectEnquirySchema : enquirySchema),
    defaultValues: { location: defaultLocation ?? (isContact ? "Not sure yet" : locations[0]), bhk: isProject ? "" : isContact ? "Not sure" : "2 BHK", message: "" },
  });
  const selectedFlatType = watch("bhk");

  const onSubmit = async (data: EnquiryOutput) => {
    const enquiry = {
      name: data.name, mobile: data.mobile, location: data.location,
      bhk: homeEnquiry ? data.bhk : "Not applicable",
      message: isContact ? [`Interested in: ${interests[interest].label}`, data.message?.trim()].filter(Boolean).join("\n") : data.message,
      source,
    };
    const url = waLink(enquiryMessage(enquiry));
    setLink(url);
    track("lead_submitted", { source, location: data.location });
    void forwardEnquiry(enquiry);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const err = (name: keyof EnquiryInput) =>
    errors[name] ? (
      <span id={`${errorId}-${name}-err`} className="enquiry-error text-[13px] font-medium text-error">{errors[name]?.message as string}</span>
    ) : null;

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className={`grid gap-4 ${isContact ? "contact-enquiry" : ""}`} aria-label="Enquiry form">
      {isContact && <fieldset className="contact-interest"><legend>I&apos;m interested in</legend><div className="contact-interest-options">{interests.map((item, index) => {
        const Icon = item.icon;
        return <button type="button" key={item.label} aria-pressed={interest === index} onClick={() => { setInterest(index); setLink(null); }}><Icon size={16} strokeWidth={1.5} aria-hidden="true" />{item.label}</button>;
      })}</div></fieldset>}
      <div className="enquiry-row grid gap-4 md:grid-cols-2">
        <label className={label}>
          Full name *
          <input className={field} autoComplete="name" placeholder={isContact ? "Your name" : undefined} aria-required="true" aria-invalid={!!errors.name} aria-describedby={errors.name ? `${errorId}-name-err` : undefined} {...register("name")} />
          {err("name")}
        </label>
        <label className={label}>
          Mobile number *
          <input className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" aria-required="true" aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? `${errorId}-mobile-err` : undefined} {...register("mobile")} />
          {err("mobile")}
        </label>
      </div>
      {isProject ? <>
        <input type="hidden" {...register("location")} />
        <fieldset className="min-w-0" role="radiogroup" aria-labelledby={`${errorId}-flat-type-label`} aria-required="true" aria-invalid={!!errors.bhk} aria-describedby={errors.bhk ? `${errorId}-bhk-err` : undefined}>
          <legend id={`${errorId}-flat-type-label`} className="mb-2 text-[13px] font-semibold tracking-[0.06em] text-navy">Flat type *</legend>
          <div className="grid grid-cols-2 gap-3">
            {["2 BHK", "3 BHK"].map((flatType) => (
              <label key={flatType} className={`flex min-h-[52px] cursor-pointer items-center gap-2 rounded-card border px-3 text-base font-semibold text-navy transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold ${selectedFlatType === flatType ? "border-navy bg-gold-tint" : "border-line bg-white"}`}>
                <input type="radio" value={flatType} required className="h-4 w-4 shrink-0 accent-navy" aria-describedby={errors.bhk ? `${errorId}-bhk-err` : undefined} {...register("bhk", { onChange: () => setLink(null) })} />
                <span className="whitespace-nowrap">{flatType}</span>
              </label>
            ))}
          </div>
          {err("bhk")}
        </fieldset>
      </> : <div className={`enquiry-row grid gap-4 ${homeEnquiry ? "md:grid-cols-2" : ""}`}>
        <label className={label}>
          Interested location
          <select className={field} {...register("location")}>
            {locations.map((l) => (<option key={l}>{l}</option>))}
            <option>Not sure yet</option>
          </select>
        </label>
        {homeEnquiry && <label className={label}>
          Configuration
          <select className={field} {...register("bhk")}>
            <option>2 BHK</option>
            <option>3 BHK</option>
            <option>Not sure</option>
          </select>
        </label>}
      </div>}
      {!isProject && <label className={label}>
        Message (optional)
        <textarea className={`${field} min-h-[110px] py-3`} aria-invalid={!!errors.message} aria-describedby={errors.message ? `${errorId}-message-err` : undefined} placeholder={isContact ? interests[interest].placeholder : "Budget, preferred visit day, questions..."} {...register("message")} />
        {err("message")}
      </label>}
      <label className="enquiry-consent flex items-start gap-2.5 text-sm text-body">
        <input type="checkbox" className="mt-1 h-[18px] w-[18px] accent-navy" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${errorId}-consent-err` : undefined} {...register("consent")} />
        <span>I agree to be contacted by {site.name} on WhatsApp or phone about my enquiry.</span>
      </label>
      {err("consent")}
      <div>
        <button type="submit" disabled={isSubmitting} className={isContact ? "enquiry-submit" : btn("gold")}>Send enquiry on WhatsApp{isContact && <ArrowUpRight size={17} aria-hidden="true" />}</button>
        {isContact && <p className="enquiry-form-note">Opens WhatsApp. Review your message before sending.</p>}
      </div>
      {link && (
        <div role="status" className="rounded-card border border-gold bg-gold-tint px-4 py-4 text-[15px]">
          Your enquiry is ready in WhatsApp — tap <b>Send</b> to reach our team.{" "}
          <a className="font-semibold underline" href={link} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a>
          <br />
          <span className="text-[13px] text-muted">
            If WhatsApp doesn’t open, call <a href={site.phoneHref} className="whitespace-nowrap underline">{site.phoneDisplay}</a>.
          </span>
        </div>
      )}
    </form>
  );
}

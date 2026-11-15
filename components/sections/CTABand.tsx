import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/SectionHeader";
import { waLink } from "@/lib/whatsapp";

export function CTABand({ warm = false }: { warm?: boolean }) {
  return (
    <section className={`${warm ? "landing-cta" : "bg-navy"} py-14 md:py-16 text-center`}>
      <Container>
        <h2 data-reveal className="font-display text-[clamp(34px,4.2vw,56px)] font-medium leading-[1.05] text-white">
          Find your <em className="font-normal text-gold">next home.</em>
        </h2>
        <p data-reveal className="mx-auto mb-9 mt-5 max-w-[560px] text-mist">
          Share your preferred location and home size.
        </p>
        <div data-reveal className="flex flex-wrap justify-center gap-3.5">
          <ButtonLink href="/contact" variant="gold">Book a site visit</ButtonLink>
          <ButtonLink href={waLink("Hi SP Properties, I would like to talk to your team.")} variant={warm ? "outline" : "outline-light"} external>Talk on WhatsApp</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

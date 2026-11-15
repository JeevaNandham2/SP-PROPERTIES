import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/SectionHeader";

export function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title" data-landing-motion>
      <div className="hero-background">
        <Image
          src="/images/hero-panorama.webp"
          alt="Architectural concept of a complete contemporary residence with landscaped frontage"
          fill
          priority
          quality={90}
          sizes="(max-width: 767px) 180vh, 100vw"
          className="hero-background-image"
        />
      </div>
      <div className="hero-overlay" aria-hidden="true" />
      <Container className="hero-content">
        <div className="hero-copy">
          <Eyebrow>SP Properties · Chennai</Eyebrow>
          <h1 id="home-hero-title" className="hero-headline font-display">A place to live.<br /><em>A space to belong.</em></h1>
          <p className="hero-description">2 & 3 BHK homes in Ambattur and across Chennai.</p>
          <div className="hero-buttons">
            <ButtonLink href="/projects" variant="gold">Find your home <ArrowUpRight size={17} aria-hidden /></ButtonLink>
            <ButtonLink href="/contact" variant="outline">Book a site visit</ButtonLink>
          </div>
        </div>
      </Container>
      <span className="hero-image-note">Architectural concept</span>
    </section>
  );
}

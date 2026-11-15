import { BuildingScene } from "@/components/three/BuildingScene";
import { Container, SectionHeader } from "@/components/ui/SectionHeader";
import { ButtonLink } from "@/components/ui/Button";

export function ArchitectureSection() {
  return (
    <section data-landing-motion className="architecture-section py-20 md:py-28" aria-label="Explore our architecture">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div data-reveal="left">
          <SectionHeader eyebrow="A different perspective" title={<>Thoughtful spaces.<br /><em className="font-normal">From every angle.</em></>} />
          <p className="mb-8 mt-6 max-w-lg">Explore an architectural concept in 3D. Rotate the building and switch the lighting, then visit our projects to experience the spaces in person.</p>
          <ButtonLink href="/contact" variant="gold">Plan your site visit</ButtonLink>
        </div>
        <div data-reveal="right"><BuildingScene /></div>
      </Container>
    </section>
  );
}

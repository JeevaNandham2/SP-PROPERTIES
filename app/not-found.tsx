import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/SectionHeader";

export default function NotFound() {
  return (
    <section className="bg-navy py-28 text-white">
      <Container>
        <p className="font-display text-7xl text-gold">404</p>
        <h1 className="mt-4 font-display text-5xl text-white">This page isn’t here.</h1>
        <p className="mb-9 mt-5 max-w-[520px] text-mist">The page may have moved. Explore our projects or get in touch with our team.</p>
        <div className="flex flex-wrap gap-3.5">
          <ButtonLink href="/projects">Explore projects</ButtonLink>
          <ButtonLink href="/" variant="outline-light">Go to home</ButtonLink>
        </div>
      </Container>
    </section>
  );
}

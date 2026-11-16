import { Container, Eyebrow } from "@/components/ui/SectionHeader";

export function FactsStrip({ facts }: { facts: { value: string; label: string }[] }) {
  return (
    <section aria-label="SP Properties at a glance" className="facts-section">
      <Container className="facts-layout">
        <div data-reveal="left" className="facts-introduction">
          <Eyebrow>Built on trust</Eyebrow>
          <h2 className="font-display">Small details.<br /><em>A lasting difference.</em></h2>
          <p>Local knowledge. Thoughtful flats. A team beside you, from the first conversation to your next chapter.</p>
        </div>
        <dl className="facts-grid">
          {facts.map((fact, index) => (
            <div key={fact.label} data-reveal data-reveal-delay={index} className="facts-tile">
              <dt>{fact.label}</dt>
              <dd className="font-display">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

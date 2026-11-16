import { collections } from './data/content';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { CollectionCard } from './CollectionCard';

export function PropertyCollections() {
  return (
    <section className="sec sec--tint" id="properties" aria-labelledby="props-title">
      <div className="wrap">
        <Reveal>
          <SectionHeading
            eyebrow="Our flats"
            id="props-title"
            title={
              <>
                Find your <em>flat.</em>
              </>
            }
          />
        </Reveal>
        <div className="pcards">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) as 0 | 1} className="pcards__item">
              <CollectionCard item={c} />
            </Reveal>
          ))}
        </div>
        <p className="note">
          SP Properties architectural renderings. Ask us for availability.
        </p>
      </div>
    </section>
  );
}

import Image from "next/image";
import type { PropertyCollection } from './types';
import { ButtonLink } from './Button';
import { Icon } from './Icon';
import { whatsappLink } from './whatsapp';

export function CollectionCard({ item }: { item: PropertyCollection }) {
  return (
    <article className={`pcard${item.bhk ? ' pcard--bhk' : ''}`} aria-labelledby={`collection-${item.id}`}>
      <div className="pcard__im">
        <Image fill sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1240px) calc((100vw - 106px) / 2), 567px" src={item.image} alt={item.imageAlt} loading="lazy" />

      </div>
      <div className="pcard__bd">
        <h3 id={`collection-${item.id}`}>{item.title}</h3>
        <p className="pcard__loc">
          <Icon name="pin" size={15} />
          {item.location}
        </p>
        <p className="muted pcard__desc">{item.description}</p>
        <div className="pcard__ft">
          <ButtonLink variant={item.bhk ? 'gold' : 'navy'} size="sm" arrow href={whatsappLink(item.whatsappText)}>
            Enquire<span className="sr-only"> about {item.title}</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

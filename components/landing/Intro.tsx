import Image from "next/image";
import Link from 'next/link';
import { site } from './site';
import { locations } from './data/locations';
import { Reveal } from './Reveal';
import { Icon } from './Icon';

export function Intro() {
  const stats = [
    { value: `${site.yearsOfExperience}`, plus: true, label: 'Years building' },
    { value: `${locations.length}`, label: 'Locations' },
    { value: '2 & 3', label: 'BHK flats' },
  ];
  return (
    <section className="sec" id="discover" aria-labelledby="intro-title">
      <div className="wrap intro">
        <Reveal className="intro__ph">
          <Image width={1277} height={1231} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 860px) 560px, (max-width: 1240px) calc((100vw - 136px) * .475), 524px"
            className="wipe"
            src="/images/about/apartment-exterior.webp"
            alt="SP Properties apartment exterior rendering with three balcony levels, grey and cream finishes, and warm lighting"
            loading="lazy"
          />

        </Reveal>
        <Reveal delay={1}>
          <p className="lbl">About us</p>
          <h2 className="h2 intro__h" id="intro-title">
            Construction Company <em>in Ambattur</em>
          </h2>
          <p className="muted lead">Flats, construction and interiors. Built around you.</p>
          <ul className="stats" aria-label="SP Properties in numbers">
            {stats.map((s) => (
              <li key={s.label}>
                <b>
                  {s.value}
                  {s.plus && <sup>+</sup>}
                </b>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
          <Link className="link" href="/about">
            About us <Icon name="arrow" size={16} />
          </Link>

        </Reveal>
      </div>
    </section>
  );
}

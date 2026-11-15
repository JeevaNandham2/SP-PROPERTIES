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
    { value: '2 & 3', label: 'BHK homes' },
  ];
  return (
    <section className="sec" id="discover" aria-labelledby="intro-title">
      <div className="wrap intro">
        <Reveal className="intro__ph">
          <Image width={1600} height={1200} sizes="(max-width: 860px) 100vw, 50vw"
            className="wipe"
            src="/landing/images/intro.jpg"
            alt="Contemporary home exterior with clean lines and large glass openings"
            loading="lazy"
          />

        </Reveal>
        <Reveal delay={1}>
          <p className="lbl">About us</p>
          <h2 className="h2 intro__h" id="intro-title">
            Construction Company <em>in Chennai</em>
          </h2>
          <p className="muted lead">Based in Ambattur. Building homes across Chennai.</p>
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

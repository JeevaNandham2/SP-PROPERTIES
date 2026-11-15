import Image from "next/image";
import { philosophy } from './data/content';
import { Reveal } from './Reveal';
import { pad2 } from './format';

export function Philosophy() {
  return (
    <section className="sec" aria-labelledby="phil-title">
      <div className="wrap phil">
        <Reveal className="phil__img">
          <Image width={1600} height={1200} sizes="(max-width: 860px) 100vw, 50vw"
            className="phil__big wipe"
            src="/landing/images/kitchen.jpg"
            alt="Bright modern kitchen and dining space"
            loading="lazy"
          />
          <Image width={800} height={600} sizes="30vw" className="phil__small" src="/landing/images/philosophy.jpg" alt="" loading="lazy" />
          <p className="phil__quote">“A home should feel right the day you walk in.”</p>
        </Reveal>
        <Reveal delay={1}>
          <p className="lbl">Our design philosophy</p>
          <h2 className="h2 phil__h" id="phil-title">
            Your Comfort. <em>Our Priority.</em>
          </h2>
          <p className="muted lead">
            Every SP Properties home starts with how your family will live in it — light, air, space and the
            small details you notice every day.
          </p>
          <ul className="plist">
            {philosophy.map((f, i) => (
              <li key={f.title}>
                <small>{pad2(i + 1)}</small>
                <b>{f.title}</b>
                <p>{f.description}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

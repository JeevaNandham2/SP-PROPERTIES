"use client";

import Image from "next/image";

import { useRef, useState } from 'react';
import { reasons } from './data/content';
import { SectionHeading } from './SectionHeading';
import { Icon } from './Icon';
import { useScrollFrame } from './hooks';

/** Dark list where the row nearest the viewport centre lights up and reveals its photo. */
export function WhyList() {
  const list = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useScrollFrame(() => {
    const rows = list.current?.children;
    if (!rows) return;
    const c = window.innerHeight / 2;
    let best = 0;
    let bd = Infinity;
    Array.from(rows).forEach((r, k) => {
      const b = r.getBoundingClientRect();
      const d = Math.abs(b.top + b.height / 2 - c);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    setActive(best);
  });

  const current = hover ?? active;
  return (
    <section className="sec sec--dark dark" aria-labelledby="why-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="Why SP Properties"
          id="why-title"
          title={
            <>
              Why Choose <em>Us?</em>
            </>
          }
          aside="Ten years of building homes in Chennai, with a team you can meet at our Ambattur office."
        />
        <ol className="wlist" ref={list}>
          {reasons.map((r, i) => (
            <li
              key={r.title}
              className={['wr', i === current && 'wr--on'].filter(Boolean).join(' ')}
              tabIndex={0}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHover(i); }}
              onPointerLeave={() => setHover(null)}
            >
              <span className="wr__no" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{r.title}</h3>
              <div className="wr__x">
                {r.image && <Image width={160} height={120} sizes="160px" src={r.image} alt="" loading="lazy" />}
                <p>{r.description}</p>
              </div>
              <span className="wr__dot" aria-hidden="true">
                <Icon name="arrow" size={12} strokeWidth={2.2} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

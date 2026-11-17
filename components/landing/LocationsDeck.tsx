"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMotionProfile } from "@/components/animations/useMotionProfile";

import { useCallback, useRef, useState } from 'react';
import { locations } from './data/locations';
import { bhkLabel } from './format';
import { clamp, fanTransform, trackProgress } from './math';
import { whatsappLink } from './whatsapp';
import { useMediaQuery, useScrollFrame, useSceneFit } from './hooks';

/**
 * Pinned, scroll-driven fanned deck. The section is tall; its content is sticky.
 * Scroll progress picks the active card; card clicks and arrow keys also navigate.
 */
export function LocationsDeck() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [spread, setSpread] = useState(0);
  const compact = useMediaQuery('(max-width: 640px)');
  const staticMode = useMotionProfile() !== "full";
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const scene = useSceneFit(staticMode);
  const n = locations.length;

  useScrollFrame(() => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const header = window.innerWidth < 768 ? 70 : 76;
    const s = clamp(1 - (r.top - header) / (vh * 0.6));
    setSpread((prev) => (Math.abs(prev - s) > 0.01 || s === 1 || s === 0 ? s : prev));
    const p = trackProgress(r.top - header, r.height, scene.container.current?.clientHeight ?? vh - header);
    setActive(Math.round(p * (n - 1)));
  }, !staticMode, track);

  const go = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const idx = clamp(i, 0, n - 1);
      if (staticMode) {
        setSpread(1);
        setActive(idx);
        return;
      }
      const header = window.innerWidth < 768 ? 70 : 76;
      const top = el.getBoundingClientRect().top + window.scrollY - header;
      const len = el.offsetHeight - (scene.container.current?.clientHeight ?? window.innerHeight - header);
      window.scrollTo({ top: top + len * (idx / (n - 1)) + 2, behavior: 'smooth' });
    },
    [n, staticMode, scene.container],
  );

  return (
    <section className="deck" id="locations" aria-labelledby="deck-title" data-static={staticMode}>
      <div
        className="deck__track"
        ref={track}
        style={{ height: staticMode ? 'auto' : `calc(100svh + ${n} * 22svh)` }}
      >
        <div className="deck__stick" ref={scene.container}>
          <div className="wrap scene-content" ref={scene.content}>
            <div className="deck__head">
              <div>
                <p className="lbl">{n} locations to explore</p>
                <h2 className="h2" id="deck-title" style={{ marginTop: 16 }}>
                  Ambattur <em>& Beyond</em>
                </h2>
              </div>

            </div>
            <div
              className="fan"
              role="list"
              aria-label="Locations. Use left and right arrow keys to explore."
              tabIndex={0}
              onTouchStart={(event) => { const touch = event.touches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }}
              onTouchEnd={(event) => {
                const start = touchStart.current; touchStart.current = null;
                if (!staticMode || !start) return;
                const touch = event.changedTouches[0];
                const dx = touch.clientX - start.x; const dy = touch.clientY - start.y;
                if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1));
              }}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  go(active + (event.key === 'ArrowRight' ? 1 : -1));
                }
              }}
            >
              {locations.map((loc, i) => {
                if (staticMode && Math.abs(i - active) > 1) return null;
                const t = fanTransform(i, active, staticMode ? 1 : spread, compact);
                const on = i === active;
                return (
                  <article
                    key={loc.slug}
                    role="listitem"
                    className={['fc', on && 'fc--on'].filter(Boolean).join(' ')}
                    style={{
                      transform: `translateX(${t.x}px) translateY(${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
                      zIndex: t.zIndex,
                      opacity: t.hidden ? 0 : 1,
                    }}
                    aria-hidden={!on || undefined}
                    onClick={() => !on && go(i)}
                  >
                    <Image sizes="270px" src={loc.image} alt={loc.imageAlt ?? `Architectural concept for ${bhkLabel(loc.configurations)} flats in ${loc.name}, presented by SP Properties, Ambattur`} loading="lazy" width={540} height={432} />
                    <div className="fc__bd">
                      <h3>{loc.name}</h3>
                      <div className="fc__meta">
                        <span>{bhkLabel(loc.configurations)}</span>
                      </div>
                      {on && (
                        <a
                          className="btn btn--navy btn--sm fc__go"
                          target="_blank"
                          rel="noopener noreferrer"
                          href={whatsappLink(
                            `Hi SP Properties, please share details of your ${bhkLabel(loc.configurations)} flats in ${loc.location}.`,
                          )}
                        >
                          Enquire
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {staticMode && <div className="deck__controls" role="group" aria-label="Browse flat locations">
              <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous location"><ArrowLeft size={18} /></button>
              <span aria-live="polite">{active + 1} / {n} <span className="sr-only">{locations[active].name}</span></span>
              <button type="button" onClick={() => go(active + 1)} disabled={active === n - 1} aria-label="Next location"><ArrowRight size={18} /></button>
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}

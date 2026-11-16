"use client";

import Image from "next/image";

import { useRef, useState } from 'react';
import { interiors } from './data/content';
import { ButtonLink } from './Button';
import { useScrollFrame, useSceneFit } from './hooks';
import { useMotionProfile } from '@/components/animations/useMotionProfile';
import { clamp, trackProgress } from './math';
import { pad2 } from './format';

/** Pinned "Step inside" section: background stays, the arched window cycles interiors on scroll. */
export function FeaturedPinned() {
  const track = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const staticMode = useMotionProfile() !== "full";
  const scene = useSceneFit(staticMode);
  const n = interiors.length;

  useScrollFrame(() => {
    const el = track.current;
    if (!el || staticMode) return;
    const r = el.getBoundingClientRect();
    const header = window.innerWidth < 768 ? 70 : 76;
    const p = trackProgress(r.top - header, r.height, scene.container.current?.clientHeight ?? window.innerHeight - header);
    el.style.setProperty('--fp', p.toFixed(3));
    el.style.setProperty('--fin', clamp(1 - r.top / window.innerHeight).toFixed(3));
    setStep(Math.min(n - 1, Math.floor(p * n * 0.999)));
  }, !staticMode, track);

  const current = interiors[step] ?? interiors[0]!;
  return (
    <section className="feat dark" id="projects" aria-labelledby="feat-title" data-static={staticMode}>
      <div className="feat__track" ref={track} style={{ height: staticMode ? 'auto' : '340svh' }}>
        <div className="feat__stick" ref={scene.container}>
          <Image fill sizes="100vw" className="feat__bg" src="/images/projects/ayyapakkam-flats.webp" alt="SP Properties apartment exterior rendering in Ayyapakkam, presented by our Ambattur team" loading="lazy" />
          <div className="wrap feat__grid scene-content" ref={scene.content}>
            <div className="feat__box">
              <p className="lbl">Inside our flats</p>
              <h2 className="h2" id="feat-title" style={{ margin: '22px 0' }}>
                Step inside.<br /><em className="g">Feel at home.</em>
              </h2>
              <ButtonLink href="/projects" arrow>
                View projects
              </ButtonLink>
              <div className="feat__steps" aria-hidden="true">
                {interiors.map((_, i) => (
                  <i key={i} className={i === step ? 'on' : undefined} />
                ))}
              </div>
              {staticMode && (
                <div className="feat__choices" role="group" aria-label="Choose an interior">
                  {interiors.map((interior, index) => (
                    <button key={interior.src} type="button" aria-pressed={step === index} onClick={() => setStep(index)}>{interior.caption}</button>
                  ))}
                </div>
              )}
            </div>
            <figure className="win" aria-label="Representative interiors">
              <div className="win__vp">
                {interiors.map((im, i) => (
                  <Image
                    fill
                    sizes="(max-width: 860px) 70vw, 470px"
                    key={im.src}
                    src={im.src}
                    alt={im.alt}
                    aria-hidden={i !== step}
                    loading={i ? 'lazy' : undefined}
                    className={i === step ? 'on' : i < step ? 'past' : undefined}
                  />
                ))}
              </div>
              <figcaption className="win__cap" aria-live="polite">
                <b>{pad2(step + 1)}</b>
                <span>{current.caption}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

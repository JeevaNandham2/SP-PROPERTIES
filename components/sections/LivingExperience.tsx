"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

const scenes = [
  {
    image: "/images/int-living.jpg",
    alt: "A bright living room with comfortable seating and natural light",
    eyebrow: "Space to slow down",
    title: "Come home to calm.",
    text: "A quiet morning. Your favourite corner. Space for the little things that make a home yours.",
  },
  {
    image: "/images/int-dining.jpg",
    alt: "A dining space arranged for shared family meals",
    eyebrow: "Room for togetherness",
    title: "Make room for moments.",
    text: "Long conversations. Shared meals. The everyday moments you will remember for years.",
  },
  {
    image: "/images/int-kitchen.jpg",
    alt: "A contemporary kitchen with space for daily cooking",
    eyebrow: "A place that feels like you",
    title: "Your life. Beautifully at home.",
    text: "Discover 2 and 3 BHK flats in Ambattur and beyond. Find the space for your next chapter.",
  },
];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

export function LivingExperience() {
  const track = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function update() {
      if (!element || element.dataset.animated !== "true") return;
      const bounds = element.getBoundingClientRect();
      const stickyTop = window.innerWidth < 768 ? 70 : 76;
      const distance = bounds.height - (window.innerHeight - stickyTop);
      const progress = clamp((stickyTop - bounds.top) / Math.max(1, distance));
      const expand = smooth(progress / 0.3);
      const firstTransition = smooth((progress - 0.28) / 0.14);
      const secondTransition = smooth((progress - 0.65) / 0.14);
      const weights = [1 - firstTransition, firstTransition * (1 - secondTransition), secondTransition];
      const active = weights.indexOf(Math.max(...weights));

      const initialInset = window.innerWidth < 768 ? 4 : 9;
      element.style.setProperty("--story-inset", `${(1 - expand) * initialInset}%`);
      element.style.setProperty("--story-radius", `${(1 - expand) * 30}px`);
      element.dataset.scene = String(active);
      panels.current.forEach((panel, index) => {
        if (!panel) return;
        panel.style.setProperty("--scene-opacity", String(weights[index]));
        panel.style.setProperty("--scene-scale", String(1.06 - weights[index] * 0.06));
        panel.style.setProperty("--scene-offset", `${(1 - weights[index]) * 24}px`);
        panel.inert = index !== active;
        panel.setAttribute("aria-hidden", String(index !== active));
      });
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    function configure() {
      if (!element) return;
      cancelAnimationFrame(frame);
      const animated = !motion.matches && window.innerHeight >= 620;
      element.dataset.animated = String(animated);
      panels.current.forEach((panel) => {
        if (!panel) return;
        panel.inert = false;
        panel.removeAttribute("aria-hidden");
        panel.removeAttribute("style");
      });
      if (animated) update();
    }

    configure();
    motion.addEventListener("change", configure);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", configure);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
    };
  }, []);

  return (
    <section className="living-experience" data-scroll-scene aria-label="Discover life at home">
      <div ref={track} className="living-track">
        <div className="living-sticky">
          <a href="#featured-projects" className="living-skip">Explore projects <ArrowUpRight size={15} aria-hidden="true" /></a>
          <div className="living-stage">
            {scenes.map((scene, index) => (
              <article key={scene.image} ref={(element) => { panels.current[index] = element; }} className="living-scene">
                <Image src={scene.image} alt={scene.alt} fill sizes="100vw" className="living-image" />
                <div className="living-shade" aria-hidden="true" />
                <div className="living-copy">
                  <p className="living-eyebrow">{scene.eyebrow}</p>
                  <h2 className="font-display">{scene.title}</h2>
                  <p className="living-description">{scene.text}</p>
                  {index === scenes.length - 1 && <ButtonLink href="/projects" variant="gold">Find your home <ArrowUpRight size={16} aria-hidden="true" /></ButtonLink>}
                </div>
              </article>
            ))}
          </div>
          <div className="living-progress" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect } from "react";

/** One scroll listener coordinates image parallax and the project-card fan. */
export function LandingMotion() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".landing-page");
    if (!page) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-landing-motion]"));
    let frame = 0;

    function update() {
      if (motion.matches) return;
      const viewport = window.innerHeight;
      const mobile = window.innerWidth < 768;
      sections.forEach((section) => {
        const bounds = section.getBoundingClientRect();
        if (bounds.bottom < 0 || bounds.top > viewport) return;
        const progress = Math.min(1, Math.max(0, (viewport - bounds.top) / (viewport + bounds.height)));
        const drift = (progress - 0.5) * (mobile ? 24 : 70);
        section.style.setProperty("--image-drift", `${drift}px`);
        section.style.setProperty("--fan-spread", String(window.innerWidth < 1024 ? 0 : Math.max(0, 1 - progress * 2.4)));
      });
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    function configure() {
      sections.forEach((section) => {
        section.style.removeProperty("--image-drift");
        section.style.removeProperty("--fan-spread");
      });
      schedule();
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
      sections.forEach((section) => {
        section.style.removeProperty("--image-drift");
        section.style.removeProperty("--fan-spread");
      });
    };
  }, []);

  return null;
}

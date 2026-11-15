"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import styles from "./OpeningAnimation.module.css";

// Run before the first paint, independently of React hydration. The overlay is
// hidden by default, so no-JavaScript and returning visitors see the page directly.
const bootstrap = `(() => {
  const intro = document.currentScript && document.currentScript.parentElement;
  if (!intro || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    if (sessionStorage.getItem('sp-opening-seen-v1')) return;
    sessionStorage.setItem('sp-opening-seen-v1', '1');
  } catch { /* Storage is optional; the persistent layout still prevents route replays. */ }
  intro.dataset.play = 'true';
})();`;

/** A brief welcome on the first visit in a tab; never a page-loading gate. */
export function OpeningAnimation() {
  const pathname = usePathname();
  const skipOpening = pathname === "/testimonials" || pathname === "/testimonials/";
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const intro = root.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // CSS starts at first paint and can finish before a slow connection hydrates.
    if (!intro || intro.dataset.play !== "true" || document.hidden || reducedMotion.matches || getComputedStyle(intro).visibility === "hidden") {
      setVisible(false);
      return;
    }

    setReady(true);
    const dismiss = () => setVisible(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") dismiss();
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !intro.contains(event.target)) dismiss();
    };
    const onMotionChange = () => { if (reducedMotion.matches) dismiss(); };
    const onVisibilityChange = () => { if (document.hidden) dismiss(); };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !intro.contains(event.target)) dismiss();
    };

    // Let visitors interact immediately; do not lock scrolling or move focus.
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("touchmove", dismiss, { passive: true });
    reducedMotion.addEventListener("change", onMotionChange);
    // Also remove the overlay if an animation-end event is interrupted.
    const timeout = window.setTimeout(dismiss, 1800);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchmove", dismiss);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [visible, skipOpening]);

  // Client stories should be visible from the first paint, with no welcome overlay.
  if (!visible || skipOpening) return null;

  return (
    <div
      ref={root}
      className={styles.opening}
      data-site-intro=""
      data-ready={ready || undefined}
      suppressHydrationWarning
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setVisible(false);
      }}
    >
      {/* Only data-play is set before hydration; all other markup stays identical. */}
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <div className={`${styles.curtain} ${styles.left}`} aria-hidden="true" />
      <div className={`${styles.curtain} ${styles.right}`} aria-hidden="true" />

      <div className={styles.topline} aria-hidden="true">
        <span className={styles.welcome}>Welcome home</span>
        <span className={styles.brand}>{site.name}</span>
      </div>

      <div className={styles.content} aria-hidden="true">
        <div className={styles.emblem}>
          <svg className={styles.architecture} viewBox="0 0 320 300" fill="none" aria-hidden="true">
            <path className={styles.outline} pathLength="1" d="M24 278V96L160 22L296 96V278" />
            <path className={styles.innerOutline} pathLength="1" d="M50 278V112L160 52L270 112V278" />
            <path className={styles.baseline} d="M0 278H320" />
          </svg>
          <div className={styles.logoReveal}>
            <span className={styles.logo}>
              <Image src="/brand/logo-mark.png" alt="" width={242} height={400} sizes="128px" priority />
            </span>
          </div>
        </div>
        <p className={styles.tagline}>{site.tagline}</p>
        <div className={styles.rule}><span /></div>
        <p className={styles.location}>{site.market}</p>
      </div>

      <button type="button" className={styles.skip} aria-label="Skip opening animation" onClick={() => setVisible(false)}>
        Skip intro <span aria-hidden="true">&rarr;</span>
      </button>
    </div>
  );
}

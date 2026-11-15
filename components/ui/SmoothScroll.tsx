"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMotionProfile } from "@/components/animations/useMotionProfile";

/** Enhance wheel scrolling without replacing touch gestures or native page history. */
export function SmoothScroll() {
  const pathname = usePathname();
  const profile = useMotionProfile();

  useEffect(() => {
    const update = () => { document.documentElement.dataset.pageHidden = String(document.hidden); };
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      (entry.target as HTMLElement).dataset.motionVisible = String(entry.isIntersecting);
    }));
    document.querySelectorAll(".page-hero, .sp-promo-art").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.motion = profile;
    if (profile !== "full") return;
    let frame = 0;
    let running = false;
    // A dormant page needs no animation loop. Reset the clock when waking to
    // avoid a large time delta after reading a page or returning to the tab.
    const tick = (time: number) => {
      frame = 0;
      if (document.hidden || lenis.isStopped) { running = false; return; }
      if (!running) { lenis.time = time; running = true; }
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") frame = requestAnimationFrame(tick);
      else running = false;
    };
    const wake = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
    const sleep = () => { cancelAnimationFrame(frame); frame = 0; running = false; };
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      stopInertiaOnNavigate: true,
      prevent: (node) => node.matches('textarea, select, [role="dialog"], dialog, [data-native-scroll]'),
      virtualScroll: ({ event }) => !(event instanceof WheelEvent && (event.shiftKey || event.metaKey || event.altKey)),
    });
    lenis.on("virtual-scroll", wake);
    // Anchors use the browser's current layout, focus and history handling.
    // Cancel wheel inertia first so it cannot compete with the native scroll.
    const anchorClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || event.defaultPrevented) return;
      const url = new URL(link.href);
      if (url.hash && url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) {
        if (!lenis.isStopped) { lenis.stop(); lenis.start(); }
        sleep();
      }
    };
    window.addEventListener("click", anchorClick);
    const syncLock = () => {
      const locked = getComputedStyle(document.body).overflowY === "hidden";
      if (locked && !lenis.isStopped) { lenis.stop(); sleep(); }
      else if (!locked && lenis.isStopped) lenis.start();
    };
    const visibility = () => {
      if (document.hidden) { lenis.stop(); sleep(); }
      else { lenis.start(); syncLock(); }
    };
    syncLock();
    document.addEventListener("visibilitychange", visibility);
    const locks = new MutationObserver(syncLock);
    locks.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      locks.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("click", anchorClick);
      sleep();
      lenis.destroy();
    };
  }, [pathname, profile]);

  return null;
}

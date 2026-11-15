"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
let frame: number | null = null;

function schedule() {
  if (frame !== null || document.hidden) return;
  frame = requestAnimationFrame(() => {
    frame = null;
    listeners.forEach((listener) => listener());
  });
}

/** The imported scroll scenes share a single animation-frame scheduler. */
export function useScrollFrame(callback: Listener, enabled = true, target?: RefObject<HTMLElement | null>) {
  const current = useRef(callback);
  current.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let visible = !target || !("IntersectionObserver" in window);
    const listener = () => { if (visible && !document.hidden) current.current(); };
    const observer = target?.current && "IntersectionObserver" in window ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) listener();
    }, { rootMargin: "120px 0px" }) : undefined;
    if (observer && target?.current) observer.observe(target.current);
    if (!listeners.size) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      document.addEventListener("visibilitychange", schedule);
    }
    listeners.add(listener);
    listener();
    return () => {
      observer?.disconnect();
      listeners.delete(listener);
      if (!listeners.size) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        document.removeEventListener("visibilitychange", schedule);
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
      }
    };
  }, [enabled, target]);
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => {
      setMatches(media.matches);
      schedule();
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useInView<T extends Element>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || inView) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView, threshold]);
  return { ref, inView };
}

/** Keep the complete pinned scene visible when viewport height or orientation changes. */
export function useSceneFit(disabled: boolean) {
  const container = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outer = container.current;
    const inner = content.current;
    if (!outer || !inner) return;
    if (disabled || !("ResizeObserver" in window)) {
      inner.style.setProperty('--scene-scale', '1');
      return;
    }
    let frameId = 0;
    let mounted = true;
    const fit = () => {
      if (!mounted) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const style = getComputedStyle(outer);
        const available = outer.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - 28;
        const scale = Math.min(1, Math.max(0, available) / Math.max(1, inner.offsetHeight));
        inner.style.setProperty('--scene-scale', String(scale));
      });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    observer.observe(inner);
    document.fonts.ready.then(fit);
    fit();
    return () => { mounted = false; observer.disconnect(); cancelAnimationFrame(frameId); };
  }, [disabled]);
  return { container, content };
}

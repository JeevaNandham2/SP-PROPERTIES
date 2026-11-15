"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReveal() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.getElementById("main");
    if (!root || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const registered = new Set<HTMLElement>();
    const reveal = (element: HTMLElement) => {
      element.classList.remove("is-reveal-pending");
      element.classList.add("is-revealed");
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) reveal(entry.target as HTMLElement); });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });

    const register = (nodes: HTMLElement[]) => {
      // Read positions before changing classes, avoiding repeated forced layout.
      const incoming = nodes.filter((element) => !registered.has(element)).map((element) => ({
        element, visible: motion.matches || element.classList.contains("is-revealed") || element.getBoundingClientRect().top < innerHeight - 24,
      }));
      incoming.forEach(({ element, visible }) => {
        // Already-visible content and restored scroll positions never flash or disappear.
        registered.add(element);
        if (visible) {
          reveal(element);
        } else {
          element.classList.add("is-reveal-pending");
          observer.observe(element);
        }
      });
    };
    const reduceMotion = () => { if (motion.matches) registered.forEach(reveal); };
    const focusReveal = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      let element = event.target.closest<HTMLElement>("[data-reveal]");
      while (element) { reveal(element); element = element.parentElement?.closest<HTMLElement>("[data-reveal]") ?? null; }
    };
    document.body.classList.add("has-scroll-reveal");
    register(Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]")));
    // Inspect only added subtrees, not every card each time a counter changes.
    const content = new MutationObserver((records) => {
      const added = new Set<HTMLElement>();
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches("[data-reveal]")) added.add(node);
        node.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => added.add(element));
      }));
      registered.forEach((element) => { if (!element.isConnected) { observer.unobserve(element); registered.delete(element); } });
      register(Array.from(added));
    });
    content.observe(root, { childList: true, subtree: true });
    motion.addEventListener("change", reduceMotion);
    root.addEventListener("focusin", focusReveal);
    return () => {
      content.disconnect();
      observer.disconnect();
      motion.removeEventListener("change", reduceMotion);
      root.removeEventListener("focusin", focusReveal);
      registered.forEach((element) => element.classList.remove("is-reveal-pending"));
      document.body.classList.remove("has-scroll-reveal");
    };
  }, [pathname]);

  return null;
}

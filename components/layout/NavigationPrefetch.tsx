"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { nav } from "@/content/site";

/** Warm the small main menu, including links hidden inside the mobile menu. */
export function NavigationPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // Next disables prefetching in development; use a production preview to
    // measure navigation without on-demand compilation.
    if (process.env.NODE_ENV !== "production") return;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType ?? "")) return;

    const routes = nav.filter(({ href }) => href !== window.location.pathname);
    let cancelled = false;
    let idle: number | undefined;
    let timer: number | undefined;

    const schedule = () => {
      if (cancelled || routes.length === 0) return;
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(warmNextRoute, { timeout: 1500 });
      } else {
        timer = window.setTimeout(warmNextRoute, 200);
      }
    };
    const warmNextRoute = () => {
      if (cancelled) return;
      const route = routes.shift();
      if (route) router.prefetch(route.href);
      schedule();
    };

    // Let the current page's images and fonts finish before background work.
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [router]);

  return null;
}

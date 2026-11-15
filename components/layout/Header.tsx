"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { btn } from "@/components/ui/Button";
import { ServicesDropdown } from "@/components/layout/ServicesDropdown";

function HeaderLogo({ alt = "" }: { alt?: string }) {
  return (
    <span className="header-logo">
      <Image src="/brand/logo-mark.png" alt={alt} width={242} height={400} priority className="h-16 w-auto" />
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/projects" && pathname.startsWith("/ambattur"));

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const opener = openerRef.current;
    panel?.querySelector<HTMLElement>("a,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panel) {
        const f = panel.querySelectorAll<HTMLElement>("a,button");
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [open]);

  return (
    <header className={`site-header sticky top-0 ${open ? "z-[80]" : "z-50"}`} data-theme="warm">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-navy">
        Skip to content
      </a>
      <div className="header-inner mx-auto flex max-w-container items-center justify-between gap-5 px-5 md:px-8">
        <Link href="/" aria-label={`${site.name} — home`} className="header-brand">
          <HeaderLogo />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="header-nav flex items-center">
            {nav.map((n) => (
              <li key={n.href}>
                {n.href === "/services" ? <ServicesDropdown active={isActive(n.href)} /> : (
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`header-nav-link ${isActive(n.href) ? "is-active" : ""}`}
                >
                  {n.label}
                </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/contact" className="header-visit hidden xl:inline-flex">Book a site visit <ArrowUpRight size={17} aria-hidden="true" /></Link>

        <button
          ref={openerRef}
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
          className="header-menu-toggle inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white xl:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-navy p-6 xl:hidden">
          <div className="mb-6 flex items-center justify-between">
            <HeaderLogo alt={site.name} />
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 text-white">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile">
            {nav.map((n) => n.href === "/services" ? (
              <ServicesDropdown key={n.href} mobile active={isActive(n.href)} onNavigate={() => setOpen(false)} />
            ) : (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} aria-current={isActive(n.href) ? "page" : undefined} className="block border-b border-white/10 py-3 font-display text-[38px] text-white">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/contact" onClick={() => setOpen(false)} className={btn("gold", "mt-8 self-start")}>Book a site visit</Link>
          <p className="mt-6 text-mist">
            WhatsApp <span className="whitespace-nowrap">{site.phoneDisplay}</span>
            <br />
            {site.email}
          </p>
        </div>
      )}
    </header>
  );
}

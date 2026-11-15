"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/content/services";

export function ServicesDropdown({ mobile = false, active, onNavigate }: {
  mobile?: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = mobile ? "mobile-services" : "desktop-services";

  useEffect(() => {
    if (!expanded) return;
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        setExpanded(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    root.current?.addEventListener("keydown", escape);
    const element = root.current;
    return () => {
      document.removeEventListener("pointerdown", outside);
      element?.removeEventListener("keydown", escape);
    };
  }, [expanded]);

  function navigate() {
    setExpanded(false);
    onNavigate?.();
  }

  return (
    <div ref={root} className={`services-dropdown ${mobile ? "services-dropdown-mobile" : ""}`} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
    }}>
      <button
        ref={trigger}
        type="button"
        className={`services-trigger ${active ? "is-active" : ""}`}
        aria-expanded={expanded}
        aria-controls={id}
        onClick={() => setExpanded((value) => !value)}
      >
        Services
      </button>
      {expanded && (
        <div id={id} className="services-panel">
          <ul>
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={`/services#${service.slug}`} onClick={navigate}>
                  {service.title}<ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link className="services-overview" href="/services" onClick={navigate}>View all services</Link>
        </div>
      )}
    </div>
  );
}

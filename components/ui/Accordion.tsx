"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";

export function Accordion({ items, light = false }: { items: { q: string; a: string }[]; light?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();
  return (
    <div className={`border-b ${light ? "border-white/15" : "border-line"}`}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={`border-t ${light ? "border-white/15" : "border-line"}`}>
            <h3>
              <button
                type="button"
                id={`${base}-b${i}`}
                aria-expanded={isOpen}
                aria-controls={`${base}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={`flex w-full items-center justify-between gap-6 py-5 text-left font-display text-[22px] ${light ? "text-white" : "text-ink"}`}
              >
                {it.q}
                {isOpen ? <Minus aria-hidden className="h-5 w-5 flex-none text-gold" /> : <Plus aria-hidden className="h-5 w-5 flex-none" />}
              </button>
            </h3>
            <div id={`${base}-p${i}`} role="region" aria-labelledby={`${base}-b${i}`} hidden={!isOpen} className="pb-6 pr-10">
              {it.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

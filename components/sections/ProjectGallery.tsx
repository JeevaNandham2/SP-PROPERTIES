"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { ProjectImage } from "@/content/projects";

export function ProjectGallery({ images, location }: {
  images: ProjectImage[];
  location: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageId = useId();
  const selected = images[selectedIndex] ?? images[0];

  if (!selected) return null;

  return (
    <section aria-label={`${location} flat gallery`}>
      <figure id={imageId}>
        <div className="relative aspect-square overflow-hidden rounded-card bg-soft">
          <Image
            src={selected.src}
            alt={selected.alt}
            fill
            priority={selectedIndex === 0}
            sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 96px), 50vw"
            className="object-contain"
          />
        </div>
        <figcaption className="mt-3 flex items-center justify-between gap-3 text-sm text-body" aria-live="polite" aria-atomic="true">
          <span>{selected.caption}</span>
          <span className="shrink-0 text-xs text-muted">{selectedIndex + 1} / {images.length}</span>
        </figcaption>
      </figure>
      {images.length > 1 && (
        <div className={`mt-4 grid gap-3 ${images.length === 2 ? "grid-cols-2" : "grid-cols-3"}`} role="group" aria-label="Choose a gallery image">
          {images.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`View ${photo.caption.toLowerCase()}`}
              aria-pressed={selectedIndex === index}
              aria-controls={imageId}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square min-h-11 overflow-hidden rounded-card border-2 bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy ${selectedIndex === index ? "border-navy" : "border-transparent hover:border-gold"}`}
            >
              <Image src={photo.src} alt="" fill sizes="(max-width: 1023px) 30vw, 16vw" className="object-contain" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs leading-relaxed text-muted">
        {selected.kind === "photograph"
          ? `SP Properties project photograph · ${location}.`
          : selected.kind === "rendering"
            ? `SP Properties architectural rendering · ${location}.`
            : selected.kind === "enquiry"
              ? `Contact our Ambattur team for project details and images in ${location}.`
              : "Architectural concept and sample interiors, not project photographs. Ask our Ambattur team for photos of this project."}
      </p>
    </section>
  );
}

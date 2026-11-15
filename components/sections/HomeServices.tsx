"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { services } from "@/content/services";
import { Container, SectionHeader } from "@/components/ui/SectionHeader";

export function HomeServices() {
  const [selected, setSelected] = useState(0);
  const active = services[selected];

  return (
    <section className="home-services py-20 md:py-28" data-landing-motion>
      <Container>
        <div data-reveal className="services-heading mb-12 max-w-[760px]">
          <SectionHeader eyebrow="Our services" title={<>Your ideas.<br /><em className="font-normal">Our hands. Your home.</em></>} />
        </div>
        <div className="services-showcase">
          <div data-reveal="left" className="services-visual">
            <Image key={active.image} src={active.image} alt={active.title} fill sizes="(max-width: 767px) 100vw, 50vw" className="services-showcase-image" />
            <span className="services-image-label">{active.title}</span>
          </div>
          <div className="services-accordion">
            {services.map((service, index) => (
              <div key={service.slug} data-reveal data-reveal-delay={index} className={`service-row ${selected === index ? "is-open" : ""}`}>
                <h3>
                  <button type="button" aria-expanded={selected === index} aria-controls={`home-service-${service.slug}`} onClick={() => setSelected(index)}>
                    <span className="font-display">{service.title}</span>
                    <span className="service-toggle" aria-hidden="true">{selected === index ? <Minus size={18} /> : <Plus size={18} />}</span>
                  </button>
                </h3>
                <div id={`home-service-${service.slug}`} hidden={selected !== index} className="service-row-content">
                  {selected === index && (
                    <div className="service-mobile-image">
                      <Image src={service.image} alt={service.title} fill sizes="(max-width: 767px) 100vw, 1px" className="object-cover" />
                    </div>
                  )}
                  <p>{service.summary}</p>
                  <Link href={`/services#${service.slug}`}>Explore this service <ArrowUpRight size={16} aria-hidden="true" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

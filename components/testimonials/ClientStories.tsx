"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Heart, House, MapPin, MessageCircle, Plus, X } from "lucide-react";
import { Container } from "@/components/ui/SectionHeader";
import { clientPriorities, clientStories } from "@/content/testimonials";
import { site } from "@/content/site";
import { projects } from "@/content/projects";
import { waLink } from "@/lib/whatsapp";

const priorityIcons = [House, MapPin, MessageCircle];

export function ClientStories() {
  const [priority, setPriority] = useState(0);
  const [photo, setPhoto] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const selectedPriority = clientPriorities[priority];
  const selectedPhoto = photo === null ? null : clientStories[photo];
  const featured = clientStories[0];
  const isPhotoOpen = photo !== null;

  useEffect(() => {
    const element = dialog.current;
    if (!isPhotoOpen || !element) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!element.open) element.showModal();
    closeButton.current?.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (opener.current?.isConnected) opener.current.focus({ preventScroll: true });
    };
  }, [isPhotoOpen]);

  const openPhoto = (index: number, button: HTMLButtonElement) => {
    opener.current = button;
    setPhoto(index);
  };
  const nextPhoto = (direction: number) => setPhoto((current) => current === null ? null : (current + direction + clientStories.length) % clientStories.length);

  return (
    <div className="client-stories">
      <section className="stories-opening" aria-labelledby="stories-title">
        <Container>
          <nav className="stories-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Testimonials</span></nav>
          <div className="stories-hero">
            <div className="stories-hero-copy">
              <p className="stories-kicker">SP Properties testimonials</p>
              <h1 id="stories-title">More than homes.<br /><em>People, first.</em></h1>
              <p className="stories-intro">Choosing a home is personal. Meet the Chennai families who are part of our journey, and discover how we can help with yours.</p>
              <div className="stories-hero-actions">
                <a href="#client-stories" className="stories-button">Meet our clients <ArrowDown size={17} aria-hidden="true" /></a>
                <a href="#your-priorities" className="stories-text-link">Your home, your needs <ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
              <div className="stories-facts" aria-label="About SP Properties">
                <div><strong>{site.experienceYears}<span> years</span></strong><span>Local experience</span></div>
                <div><strong>{projects.length}<span> locations</span></strong><span>Across Chennai</span></div>
                <div><strong>2 &amp; 3<span> BHK</span></strong><span>Homes to explore</span></div>
              </div>
            </div>
            <div className="stories-hero-visual" id={featured.id}>
              <span className="stories-heart-seal" aria-hidden="true"><Heart size={27} strokeWidth={1.3} /></span>
              <figure className="stories-feature">
                <button className="stories-photo-button" onClick={(event) => openPhoto(0, event.currentTarget)} aria-label={`View photo of ${featured.name} and family`}>
                  <Image src={featured.image} alt={`${featured.name} and family with the SP Properties team`} width={1600} height={1200} sizes="(max-width: 767px) calc(100vw - 52px), (max-width: 1100px) calc(53vw - 85px), (max-width: 1279px) calc(53vw - 102px), 572px" loading="eager" fetchPriority="high" priority />
                  <span className="stories-photo-expand" aria-hidden="true"><Plus size={20} /></span>
                </button>
                <figcaption>
                  <div className="stories-feature-label"><span>From our family album</span><span>01 / {String(clientStories.length).padStart(2, "0")}</span></div>
                  <h2>{featured.name} <span>&amp; family</span></h2>
                  <p>{featured.caption}</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </Container>
      </section>

      <section className="stories-collection" id="client-stories" aria-labelledby="stories-collection-title">
        <Container>
          <div className="stories-section-heading">
            <div><p className="stories-kicker">The people behind our homes</p><h2 id="stories-collection-title">Familiar faces.<br /><em>Meaningful moments.</em></h2></div>
            <p>A glimpse of the families and connections at the heart of SP Properties.</p>
          </div>
          <div className="stories-gallery">
            {clientStories.slice(1).map((client, index) => (
              <article className="stories-card" id={client.id} key={client.id} aria-labelledby={`${client.id}-name`}>
                <button className="stories-photo-button" onClick={(event) => openPhoto(index + 1, event.currentTarget)} aria-label={`View photo of ${client.name} and family`}>
                  <Image src={client.image} alt={`${client.name} and family with the SP Properties team`} width={1600} height={1200} sizes="(max-width: 767px) calc(100vw - 42px), (max-width: 1279px) calc(50vw - 64px), 576px" loading="eager" />
                  <span className="stories-photo-number" aria-hidden="true">0{index + 2}</span>
                  <span className="stories-photo-expand" aria-hidden="true"><Plus size={20} /></span>
                </button>
                <div className="stories-card-copy">
                  <div className="stories-card-name"><h3 id={`${client.id}-name`}>{client.name}</h3><span>&amp; family</span></div>
                  <h4>{client.headline}</h4>
                  <p>{client.caption}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="stories-share"><span><Heart size={18} aria-hidden="true" />Already part of our journey?</span><a href={waLink("Hi SP Properties, I would like to share my experience as a client.")} target="_blank" rel="noopener noreferrer">Share your experience <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </Container>
      </section>

      <section className="stories-priorities" id="your-priorities" aria-labelledby="priorities-title">
        <Container>
          <div className="stories-priorities-inner">
            <div className="stories-priorities-intro">
              <p className="stories-kicker">Let&apos;s begin with you</p>
              <h2 id="priorities-title">What matters<br /> <em>to you?</em></h2>
              <p>Your family, your location, your plans. Start with what feels important.</p>
              <div className="stories-priority-options" role="group" aria-label="Choose your home priority">
                {clientPriorities.map((item, index) => {
                  const Icon = priorityIcons[index];
                  return <button type="button" key={item.id} aria-pressed={priority === index} aria-controls="priority-details" onClick={() => setPriority(index)}><Icon size={18} aria-hidden="true" /><span>{item.label}</span><ArrowUpRight size={17} aria-hidden="true" /></button>;
                })}
              </div>
            </div>
            <div className="stories-priority-panel" id="priority-details" role="region" aria-labelledby="priority-heading">
              <div className="stories-priority-copy" aria-live="polite" aria-atomic="true">
                <span className="stories-priority-number" aria-hidden="true">0{priority + 1}</span>
                <h3 id="priority-heading">{selectedPriority.title}</h3>
                <p>{selectedPriority.description}</p>
                <ul>{selectedPriority.points.map((point) => <li key={point}><Check size={16} aria-hidden="true" />{point}</li>)}</ul>
              </div>
              <div className="stories-priority-actions">
                <Link className="stories-button" href={selectedPriority.link}>{selectedPriority.linkLabel}<ArrowUpRight size={17} aria-hidden="true" /></Link>
                <a className="stories-whatsapp" href={waLink(selectedPriority.enquiry)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />Discuss on WhatsApp</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <dialog ref={dialog} className="stories-lightbox" aria-labelledby="photo-viewer-title" onCancel={() => setPhoto(null)} onClose={() => setPhoto(null)} onClick={(event) => { if (event.target === event.currentTarget) setPhoto(null); }} onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); nextPhoto(event.key === "ArrowRight" ? 1 : -1); }
      }}>
        {selectedPhoto && <div className="stories-lightbox-content">
          <div className="stories-lightbox-top"><p id="photo-viewer-title">{selectedPhoto.name} &amp; family <span>With SP Properties</span></p><button ref={closeButton} type="button" onClick={() => setPhoto(null)} aria-label="Close photo viewer"><X size={23} /></button></div>
          <Image src={selectedPhoto.image} alt={`${selectedPhoto.name} and family with the SP Properties team`} width={1600} height={1200} sizes="(max-width: 767px) calc(100vw - 46px), (max-width: 1048px) calc(100vw - 86px), 962px" loading="eager" />
          <div className="stories-lightbox-bottom"><span aria-live="polite">{String((photo ?? 0) + 1).padStart(2, "0")} / {clientStories.length.toString().padStart(2, "0")}</span><div><button type="button" aria-label="Previous client photo" onClick={() => nextPhoto(-1)}><ChevronLeft size={22} /></button><button type="button" aria-label="Next client photo" onClick={() => nextPhoto(1)}><ChevronRight size={22} /></button></div></div>
        </div>}
      </dialog>
    </div>
  );
}

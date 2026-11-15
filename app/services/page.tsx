import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Building2, HardHat, House, Layers3, MapPin, MessageCircle, MoveUpRight, Ruler, Check } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { services, serviceProcess, serviceFaqs } from "@/content/services";
import { site } from "@/content/site";
import { pageSeo } from "@/content/seo";
import { breadcrumbSchema, faqSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import "./services.css";

export const metadata = pageMetadata({ ...pageSeo.services, path: "/services" });
const serviceIcons = [Building2, HardHat, House, Layers3];
const shortNames = ["Flat development", "Home construction", "Interior planning", "Landowner partnerships"];

export default function ServicesPage() {
  return (
    <div className="service-page">
      <section className="service-opening svc-shell" aria-labelledby="service-title">
        <nav className="svc-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Services</span></nav>
        <div className="svc-hero-grid">
          <div className="svc-hero-copy" data-reveal><p className="svc-eyebrow"><span /> OUR SERVICES</p><h1 id="service-title">Building contractors <em>in Chennai.</em></h1><p>Residential construction, interiors and development. One local team for your plans.</p><div className="svc-hero-actions"><a className="svc-button" href="#our-services">Find your service <ArrowDown size={16} /></a><Link href="/contact" className="svc-text-link">Discuss your plans <ArrowUpRight size={16} /></Link></div><div className="svc-local-note"><MapPin size={15} /> Ambattur-based. Chennai-wide.</div></div>
          <div className="svc-hero-visual" data-reveal="right"><Image src="/images/services/planning-hero.webp" alt="Illustrative residential planning desk with a house model, architectural drawings and material samples" fill priority sizes="(max-width: 767px) 100vw, 45vw" className="svc-hero-image" /><div className="svc-hero-caption"><span className="svc-caption-icon"><Ruler size={24} strokeWidth={1.3} /></span><div><strong>Plan. Build. Belong.</strong></div></div></div>
        </div>
      </section>
      <nav className="svc-navigation svc-shell" aria-label="Explore our services">{services.map((s,i) => { const Icon=serviceIcons[i]; return <a key={s.slug} href={`#${s.slug}`}><span className="svc-nav-number">0{i+1}</span><Icon size={21} strokeWidth={1.3} /><span>{shortNames[i]}</span><ArrowUpRight size={16} /></a>; })}</nav>
      <section className="svc-offerings svc-shell" id="our-services" aria-labelledby="offerings-title">
        <div className="svc-section-heading" data-reveal><div><p className="svc-eyebrow"><span /> WHAT WE DO</p><h2 id="offerings-title">Services for <em>your home.</em></h2></div></div>
        <div className="svc-offerings-grid">{services.map((s,i) => { const Icon=serviceIcons[i]; return <article className="svc-card" data-reveal data-reveal-delay={i % 2} id={s.slug} key={s.slug}>
          {s.slug === "flat-developers" && <span id="apartments" className="svc-anchor-alias" />}
          {s.slug === "building-contractor" && <><span id="villas" className="svc-anchor-alias" /><span id="villa-construction" className="svc-anchor-alias" /></>}
          <div className="svc-card-image"><Image src={s.image} alt={s.imageAlt} fill sizes="(max-width: 767px) 100vw, 50vw" /><span className="svc-card-category"><Icon size={14} />{shortNames[i]}</span><span className="svc-card-number" aria-hidden="true">0{i+1}</span></div>
          <div className="svc-card-content"><h3>{s.title}</h3><p className="svc-card-description">{s.description}</p><ul>{s.includes.map((item) => <li key={item}><Check size={13} aria-hidden="true" />{item}</li>)}</ul><Link className="svc-card-action" href={s.cta.href}>{s.cta.label}<MoveUpRight size={17} /></Link></div>
        </article>;})}</div>
        <p className="svc-image-note">Illustrative service images.</p>
      </section>
      <section className="svc-process" id="site-visits" aria-labelledby="process-title"><div className="svc-shell"><div className="svc-section-heading" data-reveal><div><p className="svc-eyebrow"><span /> HOW IT WORKS</p><h2 id="process-title">From plans <em>to progress.</em></h2></div></div><ol>{serviceProcess.map((step,i) => <li key={step.title} data-reveal data-reveal-delay={i % 4}><span className="svc-step-number">0{i+1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></div></section>
      <section className="svc-questions svc-shell" data-reveal aria-labelledby="questions-title"><div><p className="svc-eyebrow"><span /> BEFORE WE BEGIN</p><h2 id="questions-title">Your questions,<br /><em>answered.</em></h2><Link className="svc-text-link" href="/contact">Ask our team <ArrowUpRight size={16} /></Link></div><div className="svc-faq"><Accordion items={serviceFaqs} /></div></section>
      <section className="svc-consultation svc-shell" data-reveal aria-labelledby="consultation-title"><div><p className="svc-eyebrow"><span /> LET’S GET STARTED</p><h2 id="consultation-title">Ready to <em>get started?</em></h2></div><div className="svc-consultation-actions"><Link className="svc-button" href="/contact">Discuss your project <ArrowUpRight size={18} /></Link><a className="svc-whatsapp" href={waLink("Hi SP Properties, I would like to discuss your construction and property services in Chennai.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />Connect on WhatsApp</a></div></section>
      <JsonLd data={webPageSchema({ ...pageSeo.services, path: "/services" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
      <JsonLd data={faqSchema(serviceFaqs)} />
      <JsonLd data={{ "@context":"https://schema.org", "@type":"ItemList", name:"SP Properties services in Chennai", itemListElement:services.map((s,i)=>({"@type":"ListItem",position:i+1,item:{"@type":"Service",name:s.title,description:s.description,url:`${site.url}/services#${s.slug}`,areaServed:{"@type":"City",name:"Chennai"},provider:{"@id":`${site.url}/#business`}}})) }} />
    </div>
  );
}

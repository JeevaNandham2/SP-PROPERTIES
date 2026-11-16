import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, Compass, Sparkles } from "lucide-react";
import { ProjectExplorer } from "@/components/sections/ProjectExplorer";
import { pageSeo } from "@/content/seo";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import "./projects.css";

export const metadata = pageMetadata({ ...pageSeo.projects, path: "/projects" });

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <section className="sp-promo sp-shell" aria-labelledby="promo-title">
        <div className="sp-promo-copy" data-reveal>
          <nav aria-label="Breadcrumb" className="sp-breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Our projects</span></nav>
          <p className="sp-eyebrow"><span /> SP PROPERTIES · AMBATTUR</p>
          <h1 id="promo-title">Flats in Ambattur.<br /><em>Your next address.</em></h1>
          <p>Explore new apartments in Ambattur and beyond. 2 &amp; 3 BHK flats across {new Set(projects.map(project => project.location)).size} neighbourhoods.</p>
          <div className="sp-promo-actions"><a href="#location-map" className="sp-button">Discover our locations <ArrowDown size={17} /></a><Link href="/contact" className="sp-text-link">Book a site visit <ArrowUpRight size={17} /></Link></div>
        </div>
        <div className="sp-promo-art" aria-hidden="true">
          <div className="sp-orbit sp-orbit-one" /><div className="sp-orbit sp-orbit-two" />
          <div className="sp-floating-label"><Sparkles size={15} /> A place to belong</div>
          <div className="sp-emblem"><div className="sp-emblem-face"><span className="sp-emblem-brand"><Image src="/brand/logo-mark.png" alt="" width={121} height={200} className="sp-promo-logo" priority /></span></div></div>
          <div className="sp-art-base" /><div className="sp-art-location"><Compass size={22} /><div>Rooted in Ambattur<span>Made for your next move</span></div></div>
        </div>
        <div className="sp-promo-bottom"><span><strong>{new Set(projects.map(project => project.location)).size}</strong> neighbourhoods</span><span><strong>2 &amp; 3</strong> BHK flats</span></div>
      </section>
      <section className="sp-map-section sp-shell" id="location-map" aria-labelledby="map-title">
        <div className="sp-section-heading" data-reveal><div><p className="sp-eyebrow"><span /> OUR LOCATIONS</p><h2 id="map-title">Ambattur <em>& beyond.</em></h2></div><p>Select a pin to explore flats.</p></div>
        <Suspense fallback={<p role="status">Loading locations…</p>}><ProjectExplorer /></Suspense>
      </section>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])} />
      <JsonLd data={{ ...webPageSchema({ ...pageSeo.projects, path: "/projects", type: "CollectionPage" }), mainEntity: {
        "@type": "ItemList", name: "Flat locations from our Ambattur team", numberOfItems: projects.length,
        itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: `Flats in ${p.location}`, url: `${site.url}/projects/${p.slug}` })),
      } }} />
    </div>
  );
}

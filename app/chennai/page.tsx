import Link from "next/link";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { Container, SectionHeader } from "@/components/ui/SectionHeader";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { projects } from "@/content/projects";
import { pageSeo } from "@/content/seo";
import { site } from "@/content/site";
import { faqSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import { btn } from "@/components/ui/Button";

export const metadata = pageMetadata({ ...pageSeo.chennai, path: "/chennai" });

const options = [
  { title: "House construction", text: "Share your Chennai plot location, site dimensions and planned floor area. Discuss the design, materials, work involved and budget with our Ambattur team.", href: "/services#building-contractor", link: "Discuss your construction plans" },
  { title: "Apartment interiors", text: "Bring a floor plan and your room requirements. Review layouts, storage, finishes and the scope of work before agreeing on an interior proposal.", href: "/services#interior-services", link: "Explore interior services" },
  { title: "Landowner joint ventures", text: "Start with your land location, dimensions and available documents. Our team can discuss site feasibility and the terms of a potential residential development partnership.", href: "/services#joint-venture", link: "Explore a joint venture" },
];

const questions = [
  { q: "Which Chennai locations can I explore?", a: `Our project pages cover ${[...new Set(projects.map(project => project.location))].join(", ")}. Choose a location and ask the team to confirm current availability and the exact project address.` },
  { q: "How can I compare flats in different areas?", a: "Share your preferred areas, flat type and budget. Ask for current floor plans, prices and project details, then arrange site visits to compare the layouts and your actual travel routes." },
  { q: "Can I discuss construction on my own plot?", a: "Yes. Share the plot address, dimensions and your requirements. Our Ambattur team will confirm whether the location and proposed work are suitable and discuss the next steps." },
  { q: "Where can I meet SP Properties?", a: `Our office is at ${site.address.full}. Call ${site.phoneDisplay} to arrange a meeting or site visit.` },
];

export default function ChennaiPage() {
  return (
    <>
      <PageHero
        eyebrow="Ambattur roots. Chennai connections."
        title={<>Flats &amp; construction <em>in Chennai.</em></>}
        intro="Find a location that fits your plans. Explore flats or discuss construction, interiors and land development with our Ambattur team."
        crumbs={[{ name: "Home", path: "/" }, { name: "Chennai", path: "/chennai" }]}
      />
      <section className="py-10 md:py-16" aria-labelledby="chennai-locations">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 md:items-end" data-reveal>
            <div><p className="mb-3 text-eyebrow uppercase text-muted">Choose your neighbourhood</p><h2 id="chennai-locations" className="font-display text-4xl text-ink">Explore flat locations.</h2></div>
            <p className="max-w-lg">Compare 2 BHK and 3 BHK options by area. Open a project page for images and an enquiry form; our team will confirm prices, floor plans and availability.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <Link key={project.slug} href={`/projects/${project.slug}`} className="flex min-h-24 items-center justify-between gap-4 rounded-card border border-line bg-white p-5 transition hover:border-navy">
                <span><strong className="block text-lg font-medium text-ink">{project.name || project.location}</strong><span className="mt-1 block text-sm text-muted">{project.configurations.map(config => `${config.bhk} BHK`).join(" & ")} flats{project.name ? ` · ${project.location}` : ""}</span></span>
                <ArrowUpRight className="shrink-0 text-navy" size={20} aria-hidden />
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm"><Link href="/ambattur" className="underline underline-offset-4">Buying a flat in Ambattur?</Link> Read our local guide and common questions before your visit.</p>
        </Container>
      </section>
      <section className="bg-soft py-10 md:py-16" aria-labelledby="chennai-services">
        <Container>
          <div data-reveal><p className="mb-3 text-eyebrow uppercase text-muted">Plan your next project</p><h2 id="chennai-services" className="font-display text-4xl text-ink">Build, finish or develop.</h2></div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {options.map(option => <article key={option.href} className="flex flex-col rounded-card border border-line bg-white p-6" data-reveal>
              <h3 className="font-display text-3xl text-ink">{option.title}</h3>
              <p className="mb-6 mt-4 text-base leading-relaxed">{option.text}</p>
              <Link href={option.href} className="mt-auto inline-flex min-h-11 items-center justify-between gap-3 text-sm font-medium text-navy">{option.link}<ArrowUpRight size={18} className="shrink-0" aria-hidden /></Link>
            </article>)}
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-16">
        <Container className="grid gap-10 lg:grid-cols-2">
          <div data-reveal>
            <SectionHeader eyebrow="A team you can meet" title={<>Visit us <em>in Ambattur.</em></>} />
            <address className="mt-6 flex max-w-lg gap-3 text-base not-italic"><MapPin size={22} className="mt-1 shrink-0 text-navy" aria-hidden /><span>{site.address.full}</span></address>
            <p className="mt-5 max-w-lg">Bring your preferred location, budget and flat requirements, or your plot details for a construction discussion. Call ahead so we can arrange time with the right team.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/contact" className={btn("navy")}>Arrange a consultation</Link><a href={site.phoneHref} className={btn("outline")}><Phone size={16} aria-hidden />{site.phoneDisplay}</a></div>
          </div>
          <div data-reveal><h2 className="mb-5 font-display text-3xl text-ink">Before you get started</h2><Accordion items={questions} /></div>
        </Container>
      </section>
      <JsonLd data={webPageSchema({ ...pageSeo.chennai, path: "/chennai", type: "CollectionPage" })} />
      <JsonLd data={faqSchema(questions)} />
    </>
  );
}

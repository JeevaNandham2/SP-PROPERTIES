import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { CTABand } from "@/components/sections/CTABand";
import { Accordion } from "@/components/ui/Accordion";
import { Container, SectionHeader } from "@/components/ui/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProject } from "@/content/projects";
import { ambatturFaqs } from "@/content/faqs";
import { pageSeo } from "@/content/seo";
import { site } from "@/content/site";
import { faqSchema, pageMetadata, webPageSchema } from "@/lib/seo";

export const metadata = pageMetadata({ ...pageSeo.ambattur, path: "/ambattur" });

export default function AmbatturPage() {
  const ambattur = getProject("flats-in-ambattur")!;
  const nearby = ["flats-in-korattur", "flats-in-thirumullaivoyal", "flats-in-annanur"].map((s) => getProject(s)!);
  return (
    <>
      <PageHero
        eyebrow="Our neighbourhood"
        title={<>Apartments for sale <em>in Ambattur.</em></>}
        intro="Explore 2 & 3 BHK flats or discuss house construction with our local team."
        crumbs={[{ name: "Home", path: "/" }, { name: "Ambattur", path: "/ambattur" }]}
      />
      <section className="py-10 md:py-16">
        <Container className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div data-reveal>
            <SectionHeader eyebrow="Your local team" title={<>Based in <em className="font-normal">Kallikuppam.</em></>} />
            <p className="mt-5 max-w-lg">Compare residential apartments in Ambattur. Get floor plans, current prices and a site visit with SP Properties.</p>
            <div className="mt-6 divide-y divide-line border-y border-line">
              <Link href="/projects/flats-in-ambattur" className="flex items-center justify-between gap-4 py-4 font-medium">2 &amp; 3 BHK flats in Ambattur <ArrowUpRight size={18} aria-hidden /></Link>
              <Link href="/services#building-contractor" className="flex items-center justify-between gap-4 py-4 font-medium">House construction services <ArrowUpRight size={18} aria-hidden /></Link>
              <Link href="/services#interior-services" className="flex items-center justify-between gap-4 py-4 font-medium">Home interior planning <ArrowUpRight size={18} aria-hidden /></Link>
            </div>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4"><MapPin size={17} aria-hidden />Visit our Ambattur office</a>
          </div>
          <ProjectCard project={ambattur} priority />
        </Container>
      </section>
      <section className="bg-soft py-10 md:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4" data-reveal>
            <h2 className="font-display text-3xl text-ink">Nearby homes</h2>
            <Link href="/projects" className="text-sm underline underline-offset-4">All Chennai locations</Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nearby.map((p) => <ProjectCard key={p.slug} project={p} />)}
          </div>
        </Container>
      </section>
      <section className="py-10 md:py-16">
        <Container className="max-w-[900px]">
          <SectionHeader eyebrow="Quick answers" title="Planning a home in Ambattur" className="mb-6" />
          <div data-reveal><Accordion items={ambatturFaqs} /></div>
        </Container>
      </section>
      <JsonLd data={webPageSchema({ ...pageSeo.ambattur, path: "/ambattur" })} />
      <JsonLd data={faqSchema(ambatturFaqs)} />
      <CTABand />
    </>
  );
}

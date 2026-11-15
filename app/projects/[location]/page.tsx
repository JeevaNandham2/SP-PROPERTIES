import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Container, Eyebrow } from "@/components/ui/SectionHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProject, projects } from "@/content/projects";
import { locationSeo } from "@/content/seo";
import { pageMetadata, webPageSchema } from "@/lib/seo";

type Params = { params: Promise<{ location: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ location: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const { location } = await params;
  const p = getProject(location);
  if (!p) return {};
  return pageMetadata(locationSeo(p));
}

export default async function LocationPage({ params }: Params) {
  const { location } = await params;
  const p = getProject(location);
  if (!p) notFound();
  const nearby = p.nearby.map((s) => getProject(s)!).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={`Projects · ${p.location}`}
        title={<>Flats for sale in <em>{p.location}</em></>}
        intro={`${p.configurations.map((c) => c.bhk).join(" & ")} BHK flats in ${p.location}, Chennai. Request current prices, floor plans and a site visit.`}
        crumbs={[{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }, { name: p.location, path: `/projects/${p.slug}` }]}
      />

      <section className="py-10 md:py-16">
        <Container className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div data-reveal="left">
            <div className="relative aspect-[16/11] overflow-hidden rounded-card">
              <Image src={p.image} alt={`Illustrative house exterior for homes in ${p.location}, Chennai`} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[["/images/int-living.jpg", "Living room"], ["/images/int-kitchen.jpg", "Kitchen"], ["/images/plan.jpg", "Floor plan"]].map(([src, alt]) => (
                <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-card">
                  <Image src={src} alt={`Sample ${alt.toLowerCase()} inspiration`} fill sizes="(max-width: 1024px) 33vw, 16vw" className="object-cover" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Illustrative exterior; sample interiors and plans. Not project photographs.</p>
          </div>

          <div data-reveal>
            {p.name && <Eyebrow>{p.name}</Eyebrow>}
            <h2 className="font-display text-[36px] font-medium leading-tight text-ink">Home details</h2>
            <table className="my-6 w-full border-collapse text-base">
              <caption className="sr-only">Home configurations and details in {p.location}</caption>
              <tbody>
                <tr className="border-t border-line"><th scope="row" className="py-3.5 text-left font-normal">Home sizes</th><td className="py-3.5 text-right">{p.configurations.map((c) => c.bhk).join(" & ")} BHK</td></tr>
                <tr className="border-t border-line"><th scope="row" className="py-3.5 text-left font-normal">Location</th><td className="py-3.5 text-right">{p.location}, Chennai</td></tr>
                {p.status && <tr className="border-y border-line"><th scope="row" className="py-3.5 text-left font-normal">Status</th><td className="py-3.5 text-right text-muted">{p.status}</td></tr>}
              </tbody>
            </table>
            <div className="mt-6 rounded-card border border-line p-6 md:p-7">
              <h3 className="mb-4 font-display text-[26px] text-ink">Check availability</h3>
              <EnquiryForm defaultLocation={p.location} source={`Project page — ${p.location}`} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft py-10 md:py-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4" data-reveal>
            <h2 className="font-display text-3xl text-ink">Nearby locations</h2>
            <Link href="/projects" className="text-sm underline underline-offset-4">All Chennai homes</Link>
          </div>
          <div className="mt-6 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {nearby.map((n) => (<ProjectCard key={n.slug} project={n} />))}
          </div>
        </Container>
      </section>

      <JsonLd
        data={{
          ...webPageSchema(locationSeo(p)),
          about: { "@type": "Place", name: `${p.location}, Chennai`, address: { "@type": "PostalAddress", addressLocality: p.location, addressRegion: "Tamil Nadu", addressCountry: "IN" } },
        }}
      />
    </>
  );
}

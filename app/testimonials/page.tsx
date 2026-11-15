import { ClientStories } from "@/components/testimonials/ClientStories";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import { pageSeo } from "@/content/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import "./testimonials.css";

export const metadata = pageMetadata({ ...pageSeo.testimonials, path: "/testimonials" });

export default function TestimonialsPage() {
  return <>
    <ClientStories />
    <JsonLd data={webPageSchema({ ...pageSeo.testimonials, path: "/testimonials", type: "CollectionPage" })} />
    <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Testimonials", path: "/testimonials" }])} />
  </>;
}

import type { Metadata } from "next";
import { site } from "@/content/site";
import { pageSeo } from "@/content/seo";
import { locations } from "@/content/projects";

export function pageMetadata(opts: { title: string; description: string; path: string }): Metadata {
  const url = `${site.url}${opts.path}`;
  const image = { url: `${site.url}/opengraph-image`, width: 1200, height: 630, alt: "SP Properties — Flats and construction in Ambattur" };
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: { title: opts.title, description: opts.description, url, siteName: site.name, locale: "en_IN", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image.url] },
  };
}

export function businessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "GeneralContractor"],
    "@id": `${site.url}/#business`,
    name: site.name,
    slogan: site.tagline,
    description: site.description,
    url: site.url,
    logo: `${site.url}/brand/logo-full.png`,
    image: `${site.url}/brand/logo-full.png`,
    telephone: site.phoneHref.replace("tel:", ""),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.line1}, ${site.address.line2}`,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    // Publish exact coordinates only after the office map pin is confirmed.
    areaServed: locations,
    sameAs: [site.socials.instagram, site.socials.facebook].filter(Boolean),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

export function aboutPageSchema() {
  return {
    ...webPageSchema({ ...pageSeo.about, path: "/about", type: "AboutPage" }),
    mainEntity: { "@id": `${site.url}/#business` },
    breadcrumb: breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: "en-IN",
    publisher: { "@id": `${site.url}/#business` },
  };
}

export function webPageSchema(opts: { title: string; description: string; path: string; type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" }) {
  const url = `${site.url}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: opts.title,
    description: opts.description,
    inLanguage: "en-IN",
    isPartOf: { "@id": `${site.url}/#website` },
    about: { "@id": `${site.url}/#business` },
    publisher: { "@id": `${site.url}/#business` },
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

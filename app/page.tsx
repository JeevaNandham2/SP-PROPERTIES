import { HomeHero } from "@/components/sections/HomeHero";
import { Intro } from "@/components/landing/Intro";
import { PropertyCollections } from "@/components/landing/PropertyCollections";
import { LocationsDeck } from "@/components/landing/LocationsDeck";
import { FeaturedPinned } from "@/components/landing/FeaturedPinned";
import { TestimonialsPreview } from "@/components/landing/TestimonialsPreview";
import { ContactSection } from "@/components/landing/ContactSection";
import { pageSeo } from "@/content/seo";
import { pageMetadata, webPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import "@/components/landing/landing.css";
import "@/components/landing/testimonials-preview.css";

export const metadata = pageMetadata({ ...pageSeo.home, path: "/" });

export default function HomePage() {
  return (
    <div className="landing-page">
      <JsonLd data={webPageSchema({ ...pageSeo.home, path: "/" })} />
      <HomeHero />
      <div className="reference-landing home-concise">
        <Intro />
        <PropertyCollections />
        <TestimonialsPreview />
        <LocationsDeck />
        <FeaturedPinned />
        <ContactSection />
      </div>
    </div>
  );
}

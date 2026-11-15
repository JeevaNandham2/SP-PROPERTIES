import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/SectionHeader";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  crumbs?: { name: string; path: string }[];
}) {
  return (
    <section className="page-hero relative isolate overflow-hidden bg-navy text-white">
      <Container className="py-10 md:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div data-reveal><Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="max-w-[920px] font-display text-[clamp(38px,5.2vw,68px)] font-medium leading-[1.1] text-white [&_em]:font-normal [&_em]:text-gold">{title}</h1>
        <p className="mt-4 max-w-[640px] text-base text-mist">{intro}</p></div>
      </Container>
    </section>
  );
}

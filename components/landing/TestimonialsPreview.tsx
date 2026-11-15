import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clientStories } from "@/content/testimonials";
import { Reveal } from "./Reveal";

export function TestimonialsPreview() {
  const [featured, ...others] = clientStories;
  return (
    <section className="sec home-stories" id="testimonials" aria-labelledby="home-stories-title">
      <div className="wrap">
        <Reveal className="home-stories-heading"><div><p className="home-stories-eyebrow"><span /> OUR CLIENTS</p><h2 id="home-stories-title">Real people.<br /><em>Shared moments.</em></h2></div></Reveal>
        <div className="home-stories-layout">
          <Reveal className="home-story-feature-wrap">
            <article className="home-story-feature"><Link href={`/testimonials#${featured.id}`} aria-label={`Meet ${featured.name} and family`}>
              <div className="home-story-feature-image"><Image src={featured.image} alt={`${featured.name} and family with the SP Properties team`} fill sizes="(max-width: 767px) calc(100vw - 40px), 58vw" /></div>
              <div className="home-story-feature-copy"><div><p className="home-story-kicker">{featured.name.toUpperCase()} &amp; FAMILY</p><h3>{featured.headline}</h3></div><span className="home-story-round-arrow" aria-hidden="true"><ArrowUpRight size={23} /></span></div>
            </Link></article>
          </Reveal>
          <div className="home-stories-side">
            {others.slice(0,2).map((client,index) => <Reveal key={client.id} delay={(index+1) as 1 | 2} className="home-story-small-wrap"><article className="home-story-small"><Link href={`/testimonials#${client.id}`} aria-label={`Meet ${client.name} and family`}><div className="home-story-small-image"><Image src={client.image} alt={`${client.name} and family with the SP Properties team`} fill sizes="(max-width: 767px) 34vw, 18vw" /></div><div className="home-story-small-copy"><h3>{client.name}<span>&amp; family</span></h3><p className="home-story-small-headline">{client.headline}</p><ArrowUpRight size={17} className="home-story-simple-arrow" aria-hidden="true" /></div></Link></article></Reveal>)}
          </div>
        </div>
        <Reveal className="home-stories-footer"><Link href="/testimonials">View client stories <ArrowUpRight size={17}/></Link></Reveal>
      </div>
    </section>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, MapPin } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { Container, Eyebrow } from '@/components/ui/SectionHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { ServiceIllustration } from '@/components/about/ServiceIllustration';
import { aboutLeadership, aboutPrinciples, aboutServices } from '@/content/about';
import { site } from '@/content/site';
import { projects } from '@/content/projects';
import { pageSeo } from '@/content/seo';
import { aboutPageSchema, breadcrumbSchema, pageMetadata } from '@/lib/seo';
import livingPhoto from '@/public/images/int-living.jpg';
import './about.css';

export const metadata = pageMetadata({ ...pageSeo.about, path: '/about' });

export default function AboutPage() {
  return (
    <div className="about-page">
      <JsonLd data={aboutPageSchema()} />
      <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />
      <section className="about-opening" aria-labelledby="about-title">
        <Container>
          <nav className="about-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">About us</span>
          </nav>
          <div className="about-hero-grid">
            <div className="about-hero-copy" data-reveal>
              <Eyebrow>About SP Properties</Eyebrow>
              <h1 id="about-title">Builders in Ambattur.<br /><em>Built around you.</em></h1>
              <p>From your first apartment to a home built on your own land, we help you find your place in Chennai.</p>
              <div className="about-actions">
                <ButtonLink href="/contact" variant="gold">Talk to our team <ArrowUpRight size={17} aria-hidden="true" /></ButtonLink>
                <a className="about-text-link" href="#about-story">Our story <ArrowDown size={17} aria-hidden="true" /></a>
              </div>
              <p className="about-hero-location"><MapPin size={16} aria-hidden="true" /> Kallikuppam, Ambattur · Chennai</p>
              <a className="about-leadership-link" href="#about-leadership">
                <span><small>Our Managing Directors</small><strong>{aboutLeadership.map((director) => director.name).join(' & ')}</strong></span>
                <ArrowDown size={18} aria-hidden="true" />
              </a>
            </div>
            <aside className="about-experience" aria-label="Our experience">
              <div className="about-profile">
                <p className="about-profile-caption">The SP Properties story</p>
                <p className="about-profile-years">
                  <strong>{site.experienceYears}<span>+</span></strong>
                  <span>Years of<br />local experience</span>
                </p>
                <p className="about-profile-statement">Built around people.<br /><em>Grounded in experience.</em></p>
                <div className="about-profile-footer">
                  <p>Ambattur roots.<br />Chennai reach.</p>
                  <Image src="/brand/logo-full.png" alt="SP Properties" width={270} height={480} sizes="48px" className="about-profile-logo" />
                </div>
              </div>
              <dl className="about-experience-stats" aria-label="SP Properties at a glance">
                <div><dt>Chennai locations</dt><dd>{projects.length}</dd></div>
                <div><dt>Core services</dt><dd>{aboutServices.length}</dd></div>
              </dl>
            </aside>
          </div>
        </Container>
      </section>

      <section className="about-story about-section" id="about-story" aria-labelledby="about-story-title">
        <Container className="about-story-grid">
          <figure className="about-story-photo">
            <div className="about-interior-frame">
              <Image src={livingPhoto} alt="A living room with a warm-toned sofa, natural light and indoor plants" fill placeholder="blur" sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1279px) 44vw, 560px" />
              <p className="about-photo-note">Room for today.<br /><em>Space for tomorrow.</em></p>
            </div>
            <figcaption>Interior inspiration · Representative photograph</figcaption>
          </figure>
          <div className="about-story-copy" data-reveal>
            <Eyebrow>Who we are</Eyebrow>
            <h2 id="about-story-title">Local roots.<br /><em>Thoughtful homes.</em></h2>
            <p>A home is more than an address. It is where everyday routines, family moments and future plans come together.</p>
            <p>From our Kallikuppam office, we help you find, build and shape your home in Chennai. Practical spaces, thoughtful details and a team you can speak to in person are at the heart of our approach.</p>
            <Link className="about-text-link about-story-link" href="/projects">Find your neighbourhood <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </Container>
      </section>

      <section className="about-leadership about-section" id="about-leadership" aria-labelledby="about-leadership-title">
        <Container>
          <div className="about-leadership-panel">
            <div className="about-leadership-heading" data-reveal>
              <Eyebrow light>Our leadership</Eyebrow>
              <h2 id="about-leadership-title">Meet our<br /><em>Managing Directors.</em></h2>
            </div>
            <ul className="about-directors" aria-label="Managing Directors">
              {aboutLeadership.map((director) => (
                <li className="about-director-card" key={director.name}>
                  {director.portrait && (
                    <div className="about-director-portrait">
                      <Image src={director.portrait.src} alt={director.portrait.alt} fill sizes="(max-width: 767px) calc(100vw - 88px), (max-width: 1279px) 36vw, 408px" style={{ objectPosition: director.portrait.objectPosition || '50% 25%' }} />
                    </div>
                  )}
                  <div className="about-director-details">
                    <h3>{director.name}</h3>
                    <p>{director.role}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="about-leadership-copy" data-reveal>
              <p>Behind every home are decisions that matter. Our approach starts with listening to your plans, your priorities and the way you want to live.</p>
              <p>From choosing a location to shaping a room, we bring those conversations back to practical spaces and thoughtful details.</p>
              <div className="about-leadership-belief">
                <span>Our guiding belief</span>
                <p>Build with care.<br /><em>Plan for real life.</em></p>
              </div>
              <Link href="/contact" className="about-text-link">Meet our team <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="about-principles about-section" aria-labelledby="about-principles-title">
        <Container>
          <div className="about-section-heading" data-reveal>
            <div><Eyebrow>The way we work</Eyebrow><h2 id="about-principles-title">What you can <em>expect.</em></h2></div>
            <p className="about-section-note">Small details. Considered decisions.<br />A home that feels like yours.</p>
          </div>
          <ol className="about-principles-grid">
            {aboutPrinciples.map((principle, index) => (
              <li className="about-principle" key={principle.title} data-reveal data-reveal-delay={String(index)}>
                <span className="about-principle-number" aria-hidden="true">0{index + 1}</span>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="about-services about-section" id="about-services" aria-labelledby="about-services-title">
        <Container>
          <div className="about-section-heading" data-reveal>
            <div><Eyebrow>What we do</Eyebrow><h2 id="about-services-title">One team. <em>Four ways to help.</em></h2></div>
            <Link href="/services" className="about-text-link">Explore services <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className="about-services-grid">
            {aboutServices.map((service, index) => (
              <article className="about-service" key={service.slug} data-reveal data-reveal-delay={String(index % 2)}>
                <span className="about-service-index" aria-hidden="true">0{index + 1}</span>
                <ServiceIllustration kind={service.slug} />
                <div className="about-service-copy">
                  <h3><Link href={`/services#${service.slug}`}>{service.title}<ArrowUpRight size={19} aria-hidden="true" /></Link></h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-visit about-section" aria-labelledby="about-visit-title">
        <Container className="about-visit-grid">
          <div data-reveal>
            <Eyebrow light>Your next chapter</Eyebrow>
            <h2 id="about-visit-title">Let’s make <em>it home.</em></h2>
            <p>Meet our team in Kallikuppam, Ambattur.</p>
          </div>
          <div className="about-contact-actions" data-reveal>
            <ButtonLink href="/contact" variant="gold">Plan your home <ArrowUpRight size={17} aria-hidden="true" /></ButtonLink>
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="about-text-link">Get directions <ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
        </Container>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Navigation, PenLine } from "lucide-react";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { Container } from "@/components/ui/SectionHeader";
import { site } from "@/content/site";
import { pageSeo } from "@/content/seo";
import { breadcrumbSchema, pageMetadata, webPageSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { waLink } from "@/lib/whatsapp";
import "./contact.css";

export const metadata = pageMetadata({ ...pageSeo.contact, path: "/contact" });

const nextSteps = [
  { title: "Share your plans", text: "Your preferred location, home size and budget." },
  { title: "Explore your options", text: "Discuss availability, floor plans or your project scope." },
  { title: "Meet our team", text: "Arrange a site visit or an office conversation." },
];

export default function ContactPage() {
  return (
    <div className="contact-page">
      <section className="contact-opening" aria-labelledby="contact-heading">
        <Container>
          <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Contact</span></nav>
          <div className="contact-introduction">
            <div className="contact-hero-copy" data-reveal>
              <p className="contact-eyebrow">Contact SP Properties</p>
              <h1 id="contact-heading">Let&apos;s talk<br /><em>about your plans.</em></h1>
              <p>Buying a home in Ambattur or building in Chennai? Talk to us about prices, floor plans, interiors or a site visit.</p>
              <div className="contact-hero-actions"><a href="#enquiry" className="contact-primary-link">Start a conversation <ArrowDown size={17} aria-hidden="true" /></a><span className="contact-location"><MapPin size={15} aria-hidden="true" /> Ambattur, Chennai</span></div>
            </div>
            <aside className="contact-connect" data-reveal="right" aria-labelledby="connect-heading">
              <div className="contact-connect-top"><div><p className="contact-eyebrow">Speak with us</p><h2 id="connect-heading">A direct connection.</h2></div><span className="contact-logo-tile" aria-hidden="true"><span className="contact-brand-mark" /></span></div>
              <div className="contact-channels">
                <a href={site.phoneHref} className="contact-channel"><span className="contact-channel-icon"><Phone size={20} strokeWidth={1.5} aria-hidden="true" /></span><span><small>Give us a call</small><strong>{site.phoneDisplay}</strong></span><ArrowUpRight size={17} aria-hidden="true" /></a>
                <a href={waLink("Hi SP Properties, I would like to discuss a home or construction project in Chennai.")} target="_blank" rel="noopener noreferrer" className="contact-channel contact-channel-whatsapp"><span className="contact-channel-icon"><MessageCircle size={20} strokeWidth={1.5} aria-hidden="true" /></span><span><small>Message our team</small><strong>Chat on WhatsApp</strong></span><ArrowUpRight size={17} aria-hidden="true" /></a>
                <a href={`mailto:${site.email}`} className="contact-channel contact-channel-email"><span className="contact-channel-icon"><Mail size={20} strokeWidth={1.5} aria-hidden="true" /></span><span><small>Send us an email</small><strong>{site.email}</strong></span><ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="contact-main" aria-label="Plan your enquiry and visit">
        <Container>
          <div className="contact-grid">
            <div className="contact-form-panel" id="enquiry" data-reveal="right">
              <div className="contact-form-heading"><div><p className="contact-eyebrow">Your enquiry</p><h2>Make your <em>next move.</em></h2><p>Choose a service. Share what matters to you.</p></div><span className="contact-form-symbol" aria-hidden="true"><PenLine size={23} strokeWidth={1.3} /></span></div>
              <EnquiryForm source="Contact page" variant="contact" />
            </div>
            <aside className="contact-support" aria-label="Office and next steps">
              <section className="contact-office" id="office" data-reveal="left" aria-labelledby="office-heading">
                <div className="contact-office-top"><p className="contact-eyebrow">Visit our office</p><span className="contact-office-pin" aria-hidden="true"><MapPin size={23} strokeWidth={1.4} /></span></div>
                <h2 id="office-heading">Local roots.<br /><em>Personal guidance.</em></h2>
                <div className="contact-office-address"><h3>SP Properties · Ambattur</h3><address>{site.address.line1}<br />{site.address.line2}<br />{site.address.locality}, {site.address.city} &ndash; {site.address.postalCode}</address></div>
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-directions"><Navigation size={17} aria-hidden="true" /><span>Get directions</span><ArrowUpRight size={17} aria-hidden="true" /></a>
                <p className="contact-visit-note">Call ahead to arrange your visit.</p>
              </section>
              <section className="contact-next" data-reveal aria-labelledby="next-steps-heading"><p className="contact-eyebrow">Simple from the start</p><h2 id="next-steps-heading">What happens next?</h2><ol>{nextSteps.map((step,index) => <li key={step.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section>
            </aside>
          </div>
        </Container>
      </section>

      <div className="contact-explore-section">
        <Container>
          <div className="contact-explore" data-reveal><p>Still finding <em>your direction?</em></p><div><Link href="/projects">Explore Chennai homes <ArrowUpRight size={16} aria-hidden="true" /></Link><Link href="/services">Our construction services <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div>
        </Container>
      </div>
      <JsonLd data={webPageSchema({ ...pageSeo.contact, path: "/contact", type: "ContactPage" })} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </div>
  );
}

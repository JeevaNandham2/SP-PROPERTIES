import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";
import { nav, site } from "@/content/site";
import { projects } from "@/content/projects";

export function Footer() {
  return (
    <footer className="bg-navy text-mist">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-8 px-5 py-12 md:px-12 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div className="col-span-2 flex items-center gap-5 md:col-span-1 md:block">
          <Image src="/brand/logo-full.png" alt={`${site.name} — ${site.tagline}`} width={270} height={480} sizes="(max-width: 767px) 54px, 72px" loading="eager" className="h-24 w-auto shrink-0 md:mb-4 md:h-32" />
          <p className="text-[15px]">Flats &amp; construction in Ambattur. A local team for your next move.</p>
        </div>
        <div>
          <h2 className="mb-4 text-eyebrow uppercase text-gold">Pages</h2>
          <ul className="grid gap-2.5 text-[15px]">
            {nav.map((n) => (<li key={n.href}><Link className="text-white hover:text-gold-hover" href={n.href}>{n.label}</Link></li>))}
            <li><Link className="text-white hover:text-gold-hover" href="/ambattur">Our Ambattur team</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-eyebrow uppercase text-gold">Locations</h2>
          <ul className="grid gap-2.5 text-[15px]">
            {projects.slice(0, 6).map((p) => (<li key={p.slug}><Link className="text-white hover:text-gold-hover" href={`/projects/${p.slug}`}>Flats in {p.location}</Link></li>))}
            <li><Link className="text-white hover:text-gold-hover" href="/projects">All locations →</Link></li>
          </ul>
        </div>
        <div className="col-span-2 min-w-0 md:col-span-1">
          <h2 className="mb-4 text-eyebrow uppercase text-gold">Contact</h2>
          <address className="grid gap-2.5 text-[15px] not-italic">
            <span>{site.address.full}</span>
            <a className="text-white hover:text-gold-hover" href={site.phoneHref}>Call: <span className="whitespace-nowrap">{site.phoneDisplay}</span></a>
            <a className="break-words text-white hover:text-gold-hover" href={`mailto:${site.email}`}>{site.email}</a>
            <a className="inline-flex items-center gap-2 text-white hover:text-gold-hover" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4" aria-hidden /> @sp_properties_official
            </a>
          </address>
        </div>
      </div>
      <div className="mx-auto flex max-w-container flex-wrap justify-between gap-4 border-t border-white/15 px-5 pb-7 pt-5 text-[13px] md:px-12">
        <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
        <span>Website by Digitalzi</span>
      </div>
    </footer>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BedDouble, MessageCircle, Pause, Play } from "lucide-react";
import { projects } from "@/content/projects";
import { waLink } from "@/lib/whatsapp";
import { useMotionProfile } from "@/components/animations/useMotionProfile";

const positions: Record<string,[number,number]> = { Thirumullaivoyal:[155,135], Annanur:[125,220], Ambattur:[280,210], Ayyapakkam:[120,310], Korattur:[420,155], Kolathur:[540,120], Perambur:[650,205], "Anna Nagar":[530,280], Koyambedu:[405,325], Maduravoyal:[275,380], Kovur:[210,450] };


export function ProjectExplorer() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const bhk = params.get("bhk") ?? "all";
  const results = useMemo(() => projects.filter((p) => bhk === "all" || p.configurations.some((c) => String(c.bhk) === bhk)),[bhk]);
  const [activeSlug,setActiveSlug] = useState(params.get("location") ?? projects[0].slug);
  const selected = results.find((p) => p.slug === activeSlug) ?? results[0] ?? projects[0];
  const motion = useMotionProfile();
  const reduced = motion === "reduced";
  const [tourRequested,setTourRequested] = useState(false);
  const [paused,setPaused] = useState(false); const [visible,setVisible] = useState(false);
  const [pageVisible,setPageVisible] = useState(true);
  const tourPaused = paused || (reduced && !tourRequested);
  const scene = useRef<HTMLDivElement>(null); const cards = useRef<HTMLDivElement>(null);
  const [cardsVisible,setCardsVisible] = useState(false);
  const cardInteractionUntil = useRef(0);
  const resumeCards = useRef<() => void>(() => {});
  const holdCards = () => { cardInteractionUntil.current = Date.now() + 2500; resumeCards.current(); };
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update(); document.addEventListener("visibilitychange",update);
    return () => document.removeEventListener("visibilitychange",update);
  },[]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setCardsVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setCardsVisible(entry.isIntersecting),{threshold:0.05});
    if(cards.current) observer.observe(cards.current);
    return () => observer.disconnect();
  },[]);
  useEffect(() => {
    const rail = cards.current;
    if(!rail || reduced || !cardsVisible || !pageVisible || results.length < 2) return;
    let frame = 0;
    let timer = 0;
    let disposed = false;
    let lastTime = 0;
    let position = rail.scrollLeft;
    let max = rail.scrollWidth - rail.clientWidth;
    let stride = rail.firstElementChild?.getBoundingClientRect().width ?? rail.clientWidth;
    stride += parseFloat(getComputedStyle(rail).columnGap) || 0;
    const keyboardFocus = () => rail.contains(document.activeElement) && !!document.activeElement?.matches(":focus-visible");
    const stop = () => { cancelAnimationFrame(frame); clearTimeout(timer); frame = 0; timer = 0; lastTime = 0; };
    const start = () => {
      stop();
      if (document.hidden || keyboardFocus()) return;
      const wait = cardInteractionUntil.current - Date.now();
      if (wait > 0) { timer = window.setTimeout(start,wait); return; }
      position = rail.scrollLeft;
      // Low-powered devices use a short native slide, then rest between cards.
      if (motion === "lite") {
        timer = window.setTimeout(() => {
          if (max > 1) rail.scrollTo({ left: rail.scrollLeft >= max - 2 ? 0 : Math.min(max,rail.scrollLeft + stride), behavior: "smooth" });
          start();
        },4000);
      } else frame = requestAnimationFrame(move);
    };
    const move = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime,50) : 0;
      lastTime = time;
      if(max > 1) {
        position += elapsed * .032;
        if(position >= max) position = 0;
        rail.scrollLeft = position;
      }
      frame = window.requestAnimationFrame(move);
    };
    resumeCards.current = start;
    const focusChanged = () => queueMicrotask(() => { if (!disposed) start(); });
    rail.addEventListener("focusin",focusChanged);
    rail.addEventListener("focusout",focusChanged);
    const resize = "ResizeObserver" in window ? new ResizeObserver(() => {
      max = rail.scrollWidth - rail.clientWidth;
      stride = (rail.firstElementChild?.getBoundingClientRect().width ?? rail.clientWidth) + (parseFloat(getComputedStyle(rail).columnGap) || 0);
      position = rail.scrollLeft;
    }) : undefined;
    resize?.observe(rail);
    start();
    return () => { disposed = true; stop(); resumeCards.current = () => {}; resize?.disconnect(); rail.removeEventListener("focusin",focusChanged); rail.removeEventListener("focusout",focusChanged); };
  },[cardsVisible,reduced,results,motion,pageVisible]);
  useEffect(() => {
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting),{threshold:.2}); if(scene.current) observer.observe(scene.current);
    return () => observer.disconnect();
  },[]);
  useEffect(() => { const value = params.get("location"); if(value) setActiveSlug(value); },[params]);
  useEffect(() => {
    if(tourPaused || !visible || !pageVisible || results.length < 2) return;
    const timer = window.setInterval(() => { setActiveSlug((slug) => results[(results.findIndex((p) => p.slug === slug)+1)%results.length].slug); },4000);
    return () => window.clearInterval(timer);
  },[tourPaused,visible,results,pageVisible]);
  const select = (slug:string) => { setActiveSlug(slug); setPaused(true); };
  const filter = (value:string) => { const next = new URLSearchParams(params.toString()); next.delete("location"); if(value === "all") next.delete("bhk"); else next.set("bhk",value); router.replace(`${pathname}${next.size ? `?${next}` : ""}`,{scroll:false}); cards.current?.scrollTo({left:0,behavior:"auto"}); };

  return <>
    <div className="sp-map-toolbar" data-reveal><div><span className="sp-live-dot" /> EXPLORE CHENNAI <span className="sp-toolbar-count">{results.length} locations</span></div><div className="sp-map-filters" role="group" aria-label="Home configuration">{["all","2","3"].map((v) => <button key={v} type="button" aria-pressed={bhk===v} onClick={() => filter(v)}>{v === "all" ? "All homes" : `${v} BHK`}</button>)}</div></div>
    <div data-reveal ref={scene} className={`sp-compact-map ${tourPaused ? "" : "is-touring"} ${visible && pageVisible ? "is-map-visible" : ""}`}>
      <div className="sp-compact-map-stage">
        <svg viewBox="0 0 800 530" className="sp-compact-map-svg" role="group" aria-label="Illustrative Chennai neighbourhood map. Select a location.">
          <defs><linearGradient id="sp-neighbour-land" x2="1" y2="1"><stop stopColor="#f5f1e3"/><stop offset="1" stopColor="#d7deca"/></linearGradient><pattern id="sp-neighbour-blocks" width="55" height="45" patternTransform="rotate(-12)" patternUnits="userSpaceOnUse"><rect x="7" y="6" width="34" height="25" rx="4" fill="#9bad8a" fillOpacity=".18"/><path d="M0 40H55 M50 0V45" stroke="#fff" strokeWidth="3" strokeOpacity=".7"/></pattern></defs>
          <g aria-hidden="true"><path d="M65 100 205 45 420 55 590 35 720 100 752 250 670 350 510 400 400 490 195 500 65 420 35 270Z" fill="#b8c2a8" transform="translate(0 13)"/><path d="M65 100 205 45 420 55 590 35 720 100 752 250 670 350 510 400 400 490 195 500 65 420 35 270Z" fill="url(#sp-neighbour-land)" stroke="#fffdf4" strokeWidth="3"/><path d="M65 100 205 45 420 55 590 35 720 100 752 250 670 350 510 400 400 490 195 500 65 420 35 270Z" fill="url(#sp-neighbour-blocks)"/><path d="M708 96Q662 190 694 256L650 364 670 350 752 250 720 100Z" fill="#bcd6d2"/><path d="M77 330Q230 258 365 290T671 224 M172 78Q240 220 350 270T465 440 M103 422Q267 407 407 303T617 99" stroke="#d4c6a9" strokeWidth="12" fill="none"/><path d="M77 330Q230 258 365 290T671 224 M172 78Q240 220 350 270T465 440 M103 422Q267 407 407 303T617 99" stroke="#fffdf4" strokeWidth="7" fill="none"/><path d="M94 180Q290 133 466 188T685 286" fill="none" stroke="#b5a06d" strokeWidth="2" strokeDasharray="5 7"/></g>
          {results.map((p) => { const [x,y]=positions[p.location]; const active=p.slug===selected.slug; const width=Math.max(90,p.location.length*7+20); return <g key={p.slug} className={`sp-animated-pin ${active?"is-active":""}`} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-pressed={active} aria-label={`Show ${p.location}`} onClick={() => select(p.slug)} onKeyDown={(e) => {if(e.key==="Enter"||e.key===" "){e.preventDefault();select(p.slug);}}}><ellipse className="sp-pin-wave" rx="18" ry="8"/><path d="M0 0V-24" stroke={active?"#bd922c":"#1e2f5b"} strokeWidth="2"/><path className="sp-pin-head" d="M0-42 12-33 0-24-12-33Z"/><circle cy="-33" r="3" fill={active?"#1e2f5b":"#f9bf2c"}/><rect className="sp-pin-nameplate" x={-width/2} y="10" width={width} height="28" rx="5"/><text y="29" textAnchor="middle">{p.location}</text></g>;})}
        </svg>
        <span className="sp-map-caption">Stylized neighbourhood map · Pins are indicative.</span>
      </div>
      <aside className="sp-map-spotlight"><div className="sp-spotlight-content" key={selected.slug}><p className="sp-eyebrow"><span/> EXPLORE THIS LOCATION</p><h3>{selected.location}</h3><p className="sp-spotlight-config"><BedDouble size={18}/>{selected.configurations.map((c)=>`${c.bhk} BHK`).join(" & ")} homes</p><p>Ask about current availability and site visits.</p><Link href={`/projects/${selected.slug}`} className="sp-button">Explore homes <ArrowUpRight size={16}/></Link></div><div className="sp-map-tour-controls"><span>{String(results.indexOf(selected)+1).padStart(2,"0")} / {results.length} locations</span><button type="button" aria-label={tourPaused?"Play location tour":"Pause location tour"} onClick={()=>{setPaused(!tourPaused);setTourRequested(true);}}>{tourPaused?<Play size={14}/>:<Pause size={14}/>}</button></div></aside>
    </div>
    <section data-reveal id="project-locations" className="sp-preview-section" aria-labelledby="locations-title"><div className="sp-preview-heading"><div><h2 id="locations-title">Homes by <em>location.</em></h2></div></div>
      <div data-native-scroll ref={cards} className={`sp-preview-rail ${!reduced && cardsVisible ? "is-auto-scrolling" : ""}`} onPointerDown={holdCards} onTouchMove={holdCards} onWheel={holdCards} onKeyDown={holdCards} tabIndex={0} role="region" aria-label="Location cards. Scroll horizontally for more locations.">{results.map((p)=>{return <article key={p.slug} className="sp-preview-card"><Link href={`/projects/${p.slug}`} className="sp-preview-image" aria-label={`Explore ${p.location}`}><Image src={p.image} alt={`Illustrative Indian-style home exterior for ${p.location}, Chennai`} fill sizes="(max-width: 600px) 85vw, (max-width: 1000px) 45vw, 30vw" className="object-cover"/><span>Chennai-style homes</span><i><ArrowUpRight size={17}/></i></Link><div className="sp-preview-body"><div><span className="sp-card-locality">CHENNAI / TAMIL NADU</span><h3><Link href={`/projects/${p.slug}`}>{p.location}</Link></h3><p><BedDouble size={14}/>{p.configurations.map((c)=>`${c.bhk} BHK`).join(" & ")} homes</p></div><a href={waLink(`Hi SP Properties, please share home details in ${p.location}.`)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${p.location}`}><MessageCircle size={18}/></a></div><div className="sp-preview-overview"><p>Ask for prices and floor plans.</p><Link href={`/projects/${p.slug}`} className="sp-card-details-button">View details <ArrowUpRight size={16}/><span className="sr-only"> for {p.location}</span></Link></div></article>;})}</div>
    </section>
  </>;
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Pause, Play } from "lucide-react";
import { projects } from "@/content/projects";
import "./earth-globe.css";

/** Orthographic sphere projection from an equirectangular Earth texture. */
export function EarthGlobe({ locationsHref = "#project-locations" }: { locationsHref?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const project = projects[active];
  const playing = !paused && !reduced && visible && !interacting;
  const change = (index: number) => { setActive((index + projects.length) % projects.length); setPaused(true); };

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    update(); motion.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .2 });
    if (sceneRef.current) observer.observe(sceneRef.current);
    return () => { motion.removeEventListener("change", update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % projects.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let disposed = false;
    let frame = 0;
    let visible = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const size = canvas.width;
    const radius = size * 0.47;
    const pixels = context.createImageData(size, size);
    const surface: { offset: number; longitude: number; latitude: number; shade: number }[] = [];
    const latitude = 18 * Math.PI / 180;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x - size / 2) / radius;
        const ny = (size / 2 - y) / radius;
        const squared = nx * nx + ny * ny;
        if (squared > 1) continue;
        const nz = Math.sqrt(1 - squared);
        surface.push({
          offset: (y * size + x) * 4,
          longitude: Math.atan2(nx, nz * Math.cos(latitude) - ny * Math.sin(latitude)),
          latitude: Math.asin(ny * Math.cos(latitude) + nz * Math.sin(latitude)),
          shade: Math.min(1.15, Math.max(0.24, -nx * 0.25 + ny * 0.32 + nz * 0.92)),
        });
      }
    }

    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);
    image.onload = () => {
      if (disposed) return;
      const texture = document.createElement("canvas");
      texture.width = image.width;
      texture.height = image.height;
      const textureContext = texture.getContext("2d");
      if (!textureContext) return;
      textureContext.drawImage(image, 0, 0);
      const source = textureContext.getImageData(0, 0, image.width, image.height).data;
      let lastTime = -Infinity;

      function draw(time: number) {
        if (disposed) return;
        if (visible && !document.hidden && time - lastTime > 65) {
          lastTime = time;
          // A gentle tilt keeps India and the Ambattur marker in view.
          const center = (80.27 + (motion.matches ? 0 : Math.sin(time / 10000) * 5)) * Math.PI / 180;
          for (const point of surface) {
            const u = ((point.longitude + center) / (2 * Math.PI) + 0.5 + 1) % 1;
            const v = 0.5 - point.latitude / Math.PI;
            const index = (Math.min(image.height - 1, Math.floor(v * image.height)) * image.width + Math.floor(u * image.width)) * 4;
            pixels.data[point.offset] = source[index] * point.shade;
            pixels.data[point.offset + 1] = source[index + 1] * point.shade;
            pixels.data[point.offset + 2] = source[index + 2] * point.shade;
            pixels.data[point.offset + 3] = 255;
          }
          context!.putImageData(pixels, 0, 0);
          const delta = 80.27 * Math.PI / 180 - center;
          const chennaiLatitude = 13.08 * Math.PI / 180;
          const pinX = size / 2 + radius * Math.cos(chennaiLatitude) * Math.sin(delta);
          const pinY = size / 2 - radius * (Math.sin(chennaiLatitude) * Math.cos(latitude) - Math.cos(chennaiLatitude) * Math.cos(delta) * Math.sin(latitude));
          context!.beginPath();
          context!.arc(pinX, pinY, motion.matches ? 12 : 8 + (time % 2200) / 2200 * 22, 0, Math.PI * 2);
          context!.strokeStyle = `rgba(249,191,44,${motion.matches ? .7 : 1 - (time % 2200) / 2200})`;
          context!.lineWidth = 2;
          context!.stroke();
          context!.beginPath();
          context!.arc(pinX, pinY, 4, 0, Math.PI * 2);
          context!.fillStyle = "#f9bf2c";
          context!.fill();
          context!.beginPath();
          context!.moveTo(pinX, pinY - 4);
          context!.lineTo(pinX, pinY - 31);
          context!.strokeStyle = "#f9bf2c";
          context!.lineWidth = 2;
          context!.stroke();
          context!.beginPath();
          context!.arc(pinX, pinY - 35, 7, 0, Math.PI * 2);
          context!.fillStyle = "#f9bf2c";
          context!.fill();
          context!.strokeStyle = "#fff8df";
          context!.stroke();
        }
        frame = requestAnimationFrame(draw);
      }
      frame = requestAnimationFrame(draw);
    };
    image.src = "/images/earth-texture.jpg";

    return () => {
      disposed = true;
      image.onload = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={sceneRef} className={`earth-tour ${playing ? "is-playing" : ""}`} onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
      <div className="earth-tour-stage">
        <div className="earth-tour-atmosphere" aria-hidden="true" />
        <canvas ref={canvasRef} width={520} height={520} className="earth-tour-canvas" role="img" aria-label="Three-dimensional Earth centred on India, with an animated marker for the Ambattur area" />
        <div className="earth-tour-clouds" aria-hidden="true" />
        <div className="earth-tour-card" key={project.slug}>
          <span className="earth-tour-kicker"><MapPin size={13} /> AMBATTUR & BEYOND</span>
          <h3>{project.location}</h3>
          <p>{project.configurations.map((c) => `${c.bhk} BHK`).join(" & ")} flats · SP Properties</p>
          <Link href={`/projects/${project.slug}`}>Explore this location <ArrowUpRight size={16} /></Link>
          <div className="earth-tour-progress" aria-hidden="true"><i /></div>
        </div>
        <span className="earth-tour-region">INDIA <span>AMBATTUR AREA</span></span>
      </div>
      <div className="earth-tour-navigation">
        <div className="earth-tour-counter"><strong>{String(active + 1).padStart(2,"0")}</strong><span>/ {projects.length} LOCATIONS</span></div>
        <div className="earth-tour-controls"><button type="button" aria-label="Previous location" onClick={() => change(active - 1)}><ArrowLeft size={17} /></button><button type="button" aria-label={paused || reduced ? "Start automatic location tour" : "Pause automatic location tour"} aria-pressed={!paused && !reduced} onClick={() => { setPaused(!(paused || reduced)); setReduced(false); }}>{paused || reduced ? <Play size={16} /> : <Pause size={16} />}</button><button type="button" aria-label="Next location" onClick={() => change(active + 1)}><ArrowRight size={17} /></button></div>
      </div>
      <div className="earth-tour-dots" role="group" aria-label="Choose a neighbourhood">{projects.map((p,i) => <button key={p.slug} type="button" aria-label={`Show ${p.location}`} aria-pressed={active === i} onClick={() => change(i)}><span /></button>)}</div>
      <p className="earth-tour-note">Ambattur area highlighted. Neighbourhoods share the regional marker; exact addresses are available from our team.</p>
      <a href={locationsHref} className="earth-tour-all">Explore all neighbourhoods <ArrowRight size={15} /></a>
    </div>
  );
}

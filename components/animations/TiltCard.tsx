"use client";

import { useEffect, useRef, type ReactNode, type PointerEvent } from "react";

export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const frame = useRef<number | null>(null);

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || document.documentElement.dataset.motion !== "full") return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty("--tilt-x", `${-y * 7}deg`);
      element.style.setProperty("--tilt-y", `${x * 7}deg`);
    });
  }

  function reset(event: PointerEvent<HTMLDivElement>) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  }

  return <div className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</div>;
}

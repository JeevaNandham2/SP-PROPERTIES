"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Moon, RotateCcw, Sun } from "lucide-react";

/** A fully dimensional CSS model. Pointer capture supports mouse, pen and touch. */
export function BuildingScene() {
  const [angle, setAngle] = useState(-28);
  const [night, setNight] = useState(false);
  const drag = useRef<{ x: number; angle: number } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    drag.current = { x: event.clientX, angle };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current) setAngle(drag.current.angle + (event.clientX - drag.current.x) * 0.45);
  }

  return (
    <div className={`building-experience ${night ? "is-night" : ""}`}>
      <div className="scene-heading"><span className="scene-dot" />Explore the architecture<span>3D studio</span></div>
      <div
        className="building-viewport"
        role="slider"
        tabIndex={0}
        aria-label="Rotate architectural concept model"
        aria-valuemin={-180}
        aria-valuemax={180}
        aria-valuenow={Math.round(((angle + 180) % 360 + 360) % 360 - 180)}
        aria-valuetext={`${Math.round(((angle + 180) % 360 + 360) % 360 - 180)} degrees`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => { drag.current = null; }}
        onPointerCancel={() => { drag.current = null; }}
        onLostPointerCapture={() => { drag.current = null; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setAngle((value) => value + (event.key === "ArrowRight" ? 10 : -10));
          }
          if (event.key === "Home") { event.preventDefault(); setAngle(-28); }
        }}
      >
        <div className="scene-orbit" aria-hidden="true" />
        <div className="building-float" aria-hidden="true">
          <div className="building-model" style={{ "--rotation": `${angle}deg` } as CSSProperties}>
            <div className="model-ground" />
            <div className="model-face model-front">
              <div className="model-roof-label">SP RESIDENCES</div>
              {[0, 1, 2, 3].map((floor) => (
                <div className="model-floor" key={floor}>
                  <div className="model-window" /><div className="model-balcony"><span /><span /></div><div className="model-window" />
                </div>
              ))}
              <div className="model-entrance"><span /><span className="model-door" /><span /></div>
            </div>
            <div className="model-face model-back">{Array.from({ length: 12 }, (_, i) => <span className="model-window" key={i} />)}</div>
            <div className="model-face model-left">{Array.from({ length: 8 }, (_, i) => <span className="model-window" key={i} />)}</div>
            <div className="model-face model-right">{Array.from({ length: 8 }, (_, i) => <span className="model-window" key={i} />)}</div>
            <div className="model-face model-roof"><div className="roof-garden" /><div className="roof-skylight" /></div>
          </div>
        </div>
      </div>
      <div className="scene-toolbar">
        <p>Drag to rotate <span>·</span> Use arrow keys</p>
        <div>
          <button type="button" aria-label="Reset model rotation" onClick={() => setAngle(-28)}><RotateCcw size={17} /></button>
          <button type="button" aria-label="Night lighting" aria-pressed={night} onClick={() => setNight((value) => !value)}>{night ? <Moon size={17} /> : <Sun size={17} />}</button>
        </div>
      </div>
      <p className="scene-disclaimer">Architectural concept illustration</p>
    </div>
  );
}

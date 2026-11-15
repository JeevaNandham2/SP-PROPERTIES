export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Progress (0→1) of scrolling through a tall track whose inner content is sticky. */
export function trackProgress(rectTop: number, rectHeight: number, viewport: number): number {
  const scrollable = rectHeight - viewport;
  if (scrollable <= 0) return rectTop <= 0 ? 1 : 0;
  return clamp(-rectTop / scrollable);
}

export interface FanTransform {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  hidden: boolean;
}

/** Position of card `index` in a fanned deck centred on `active`. `spread` 0 = stacked, 1 = fully fanned. */
export function fanTransform(index: number, active: number, spread: number, compact: boolean): FanTransform {
  const d = index - active;
  const a = Math.abs(d);
  const sx = compact ? 96 : 150;
  const sy = compact ? 10 : 16;
  const rot = compact ? 7 : 6;
  return {
    x: d * sx * spread,
    y: Math.pow(a, 1.5) * sy * spread,
    rotate: d * rot * spread,
    scale: 1 - Math.min(a, 4) * 0.06,
    zIndex: 50 - a,
    hidden: a > (compact ? 2 : 3),
  };
}

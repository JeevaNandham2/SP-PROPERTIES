import type { Configuration, Location } from './types';

/** 55 → "₹55 Lakhs", 247 → "₹2.47 Cr", 130 → "₹1.30 Cr" */
export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`;
  return `₹${lakhs} Lakhs`;
}

export const bhkLabel = (configs: Configuration[]) =>
  `${[...new Set(configs.map((c) => c.bhk))].sort().join(' & ')} BHK`;

export const startingPrice = (loc: Location) => Math.min(...loc.configurations.map((c) => c.priceLakhs));

export const pad2 = (n: number) => String(n).padStart(2, '0');

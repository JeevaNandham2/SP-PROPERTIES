import type { Configuration } from './types';

export const bhkLabel = (configs: Configuration[]) =>
  `${[...new Set(configs.map((c) => c.bhk))].sort().join(' & ')} BHK`;

export const pad2 = (n: number) => String(n).padStart(2, '0');

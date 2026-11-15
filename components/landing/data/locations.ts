import type { Location } from '../types';

/** Source: SP Properties project details (starting prices). Update here only. */
export const locations: Location[] = [
  {
    slug: 'ambattur',
    name: 'Ambattur',
    image: '/images/chennai-homes/ambattur-urban.webp',
    configurations: [
      { bhk: 2, priceLakhs: 55 },
      { bhk: 3, priceLakhs: 79 },
    ],
  },
  {
    slug: 'anna-nagar',
    name: 'Anna Nagar',
    image: '/images/chennai-homes/anna-nagar-urban.webp',
    configurations: [{ bhk: 3, priceLakhs: 247 }],
  },
  {
    slug: 'kolathur',
    name: 'Kolathur',
    image: '/images/chennai-homes/kolathur-urban.webp',
    configurations: [
      { bhk: 2, priceLakhs: 99 },
      { bhk: 3, priceLakhs: 130 },
    ],
  },
  {
    slug: 'thirumullaivoyal',
    name: 'Thirumullaivoyal',
    image: '/images/chennai-homes/thirumullaivoyal-urban.webp',
    configurations: [
      { bhk: 2, priceLakhs: 65 },
      { bhk: 3, priceLakhs: 90 },
    ],
  },
  {
    slug: 'annanur',
    name: 'Annanur',
    image: '/images/chennai-homes/annanur-v2.webp',
    configurations: [
      { bhk: 2, priceLakhs: 58 },
      { bhk: 3, priceLakhs: 71 },
    ],
  },
  {
    slug: 'ayyapakkam',
    name: 'Ayyapakkam',
    image: '/images/chennai-homes/ayyapakkam-urban.webp',
    configurations: [{ bhk: 3, priceLakhs: 102 }],
  },
  {
    slug: 'perambur',
    name: 'Perambur',
    image: '/images/chennai-homes/perambur-urban.webp',
    configurations: [{ bhk: 2, priceLakhs: 121 }],
  },
  {
    slug: 'korattur',
    name: 'Korattur',
    image: '/images/chennai-homes/korattur-urban.webp',
    configurations: [{ bhk: 2, priceLakhs: 102 }],
  },
  {
    slug: 'maduravoyal',
    name: 'Maduravoyal',
    image: '/images/chennai-homes/maduravoyal-v2.webp',
    configurations: [{ bhk: 2, priceLakhs: 80 }],
  },
  {
    slug: 'koyambedu',
    name: 'Koyambedu',
    image: '/images/chennai-homes/koyambedu-urban.webp',
    configurations: [{ bhk: 2, priceLakhs: 109 }],
  },
  { slug: 'kovur', name: 'Kovur', image: '/images/chennai-homes/kovur-urban.webp', configurations: [{ bhk: 3, priceLakhs: 94 }] },
];

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);

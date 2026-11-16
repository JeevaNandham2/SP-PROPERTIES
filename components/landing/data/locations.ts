import type { Location } from '../types';
import { getProject, getProjectPreview } from '@/content/projects';

/** Source: SP Properties project details (starting prices). Update here only. */
const locationData: Omit<Location, 'image'>[] = [
  {
    slug: 'ambattur',
    name: 'Ambattur',
    configurations: [
      { bhk: 2, priceLakhs: 55 },
      { bhk: 3, priceLakhs: 79 },
    ],
  },
  {
    slug: 'anna-nagar',
    name: 'Anna Nagar',
    configurations: [{ bhk: 3, priceLakhs: 247 }],
  },
  {
    slug: 'kolathur',
    name: 'Kolathur',
    configurations: [
      { bhk: 2, priceLakhs: 99 },
      { bhk: 3, priceLakhs: 130 },
    ],
  },
  {
    slug: 'thirumullaivoyal',
    name: 'Thirumullaivoyal',
    configurations: [
      { bhk: 2, priceLakhs: 65 },
      { bhk: 3, priceLakhs: 90 },
    ],
  },
  {
    slug: 'annanur',
    name: 'Annanur',
    configurations: [
      { bhk: 2, priceLakhs: 58 },
      { bhk: 3, priceLakhs: 71 },
    ],
  },
  {
    slug: 'ayyapakkam',
    name: 'Ayyapakkam',
    configurations: [{ bhk: 3, priceLakhs: 102 }],
  },
  {
    slug: 'perambur',
    name: 'Perambur',
    configurations: [{ bhk: 2, priceLakhs: 121 }],
  },
  {
    slug: 'korattur',
    name: 'Korattur',
    configurations: [{ bhk: 2, priceLakhs: 102 }],
  },
  {
    slug: 'maduravoyal',
    name: 'Maduravoyal',
    configurations: [{ bhk: 2, priceLakhs: 80 }],
  },
  {
    slug: 'koyambedu',
    name: 'Koyambedu',
    configurations: [{ bhk: 2, priceLakhs: 109 }],
  },
  { slug: 'kovur', name: 'Kovur', configurations: [{ bhk: 3, priceLakhs: 94 }] },
];

// Keep the homepage deck in sync with the images used on project detail pages.
export const locations: Location[] = locationData.map((location) => {
  const project = getProject(`flats-in-${location.slug}`);
  if (!project) throw new Error(`Missing project location: ${location.slug}`);
  const preview = getProjectPreview(project);
  return { ...location, image: preview.src, imageAlt: preview.alt };
});

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);

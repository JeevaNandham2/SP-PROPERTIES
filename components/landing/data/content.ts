import type { Feature, PropertyCollection } from '../types';

export const collections: PropertyCollection[] = [
  {
    id: '2-bhk',
    label: 'Everyday comfort',
    title: '2 BHK Flats',
    location: 'Ambattur & beyond',
    image: '/images/projects/perambur-flats.webp',
    imageAlt: 'SP Properties flat exterior rendering in Perambur, part of our 2 BHK collection',
    bhk: 2,
    specs: ['2 bedrooms', 'Living & dining', 'Kitchen'],
    description: 'Explore 2 BHK flats in Ambattur and other locations.',
    whatsappText: 'Hi SP Properties, I am interested in a 2 BHK flat in Ambattur. Please share available locations, floor plans and site visit details.',
  },
  {
    id: '3-bhk',
    label: 'Room to grow',
    title: '3 BHK Flats',
    location: 'Ambattur & beyond',
    image: '/images/collections/three-bhk-flats.webp',
    imageAlt: 'SP Properties 3 BHK flat exterior rendering with glass balconies and vertical warm lighting',
    bhk: 3,
    specs: ['3 bedrooms', 'Living & dining', 'Kitchen'],
    description: 'Find 3 BHK flats in Ambattur with room for family life.',
    whatsappText: 'Hi SP Properties, I am interested in a 3 BHK flat in Ambattur. Please share available locations, floor plans and site visit details.',
  },
  {
    id: 'apartments',
    label: 'Apartments',
    title: 'Premium Apartments',
    location: 'Ambattur',
    image: '/images/collections/premium-apartments.webp',
    imageAlt: 'SP Properties premium apartment rendering with cream and brown finishes and illuminated balconies',
    specs: ['2 BHK', '3 BHK', 'Size on request'],
    description: 'Apartments for sale in Ambattur. Ask for current options.',
    whatsappText: 'Hi SP Properties, please share details of your apartments in Ambattur.',
  },
  {
    id: 'projects',
    label: 'Projects',
    title: 'Residential Projects',
    location: 'Ambattur + 10 locations',
    image: '/images/collections/residential-projects.webp',
    imageAlt: 'SP Properties residential apartment rendering with grey and white finishes, wood accents and three balcony levels',
    specs: ['2 & 3 BHK', 'Anna Nagar · Kolathur · Perambur & more'],
    description: 'Start with Ambattur. Explore flats in your preferred neighbourhood.',
    whatsappText: 'Hi SP Properties, please share the list of your residential projects in Ambattur and other locations.',
  },
];

export const philosophy: Feature[] = [
  {
    title: 'Thoughtful Architecture',
    description: 'Layouts planned for natural light, ventilation and privacy.',
  },
  {
    title: 'Quality Construction',
    description: 'Careful material choices and site supervision at every stage.',
  },
  { title: 'Modern Living', description: 'Contemporary elevations with practical, easy-to-maintain spaces.' },
  { title: 'Family Comfort', description: 'Flats sized and planned for everyday family life.' },
];

export const reasons: Feature[] = [
  {
    title: 'Trusted Experience',
    description: '10+ years of building apartments and villas, with roots in Ambattur.',
    image: '/images/projects/annanur-flats.webp',
  },
  {
    title: 'Quality Construction',
    description: 'Sound structure and clean finishes, checked on site at every stage.',
    image: '/images/projects/ambattur-flats.webp',
  },
  {
    title: 'Strategic Locations',
    description: '11 well-connected neighbourhoods, from Ambattur to Anna Nagar.',
    image: '/images/projects/kovur-flats.webp',
  },
  {
    title: 'Customer Satisfaction',
    description: 'Clear answers before you buy and support after you move in.',
    image: '/landing/images/int-living.jpg',
  },
];

/** Representative interiors for the pinned "Step inside" section. Replace with real project photos. */
export const interiors = [
  { src: '/landing/images/int-living.jpg', caption: 'Living room', alt: 'Representative living room interior' },
  { src: '/landing/images/kitchen.jpg', caption: 'Kitchen', alt: 'Representative kitchen interior' },
  { src: '/landing/images/int-dining.jpg', caption: 'Dining', alt: 'Representative dining area' },
  { src: '/landing/images/philosophy.jpg', caption: 'Family lounge', alt: 'Representative family lounge' },
];

export const interestOptions = [
  '2 BHK Flats',
  '3 BHK Flats',
  'Premium Apartments',
  'Residential Projects',
  'Not sure yet',
] as const;

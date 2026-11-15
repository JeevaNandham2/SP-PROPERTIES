import type { Feature, PropertyCollection } from '../types';

export const collections: PropertyCollection[] = [
  {
    id: '2-bhk',
    label: 'Everyday comfort',
    title: '2 BHK Homes',
    location: 'Across Chennai',
    image: '/images/chennai-homes/house-2.webp',
    imageAlt: 'Illustrative Chennai-style Indian home exterior for the 2 BHK collection',
    bhk: 2,
    specs: ['2 bedrooms', 'Living & dining', 'Kitchen'],
    description: 'Explore 2 BHK flats in Ambattur and across Chennai.',
    whatsappText: 'Hi SP Properties, I am interested in a 2 BHK home. Please share available locations, floor plans and site visit details.',
  },
  {
    id: '3-bhk',
    label: 'Room to grow',
    title: '3 BHK Homes',
    location: 'Across Chennai',
    image: '/images/chennai-homes/house-3.webp',
    imageAlt: 'Illustrative Chennai-style Indian home exterior for the 3 BHK collection',
    bhk: 3,
    specs: ['3 bedrooms', 'Living & dining', 'Kitchen'],
    description: 'Find 3 BHK flats in Ambattur with room for family life.',
    whatsappText: 'Hi SP Properties, I am interested in a 3 BHK home. Please share available locations, floor plans and site visit details.',
  },
  {
    id: 'apartments',
    label: 'Apartments',
    title: 'Premium Apartments',
    location: 'Ambattur, Chennai',
    image: '/images/chennai-homes/house-1.webp',
    imageAlt: 'Illustrative low-rise Indian residential exterior in Chennai style',
    specs: ['2 BHK', '3 BHK', 'Size on request'],
    description: 'Apartments for sale in Ambattur. Ask for current options.',
    whatsappText: 'Hi SP Properties, please share details of your apartments in Ambattur.',
  },
  {
    id: 'projects',
    label: 'Projects',
    title: 'Residential Projects',
    location: '11 Chennai locations',
    image: '/images/chennai-homes/landing-hero.webp',
    imageAlt: 'Illustrative Chennai residential home with a shaded balcony and landscaped frontage',
    specs: ['2 & 3 BHK', 'Anna Nagar · Kolathur · Perambur & more'],
    description: 'Explore property for sale in Chennai, in your preferred neighbourhood.',
    whatsappText: 'Hi SP Properties, please share the list of your residential projects across Chennai.',
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
  { title: 'Family Comfort', description: 'Homes sized and planned for real Chennai families.' },
];

export const reasons: Feature[] = [
  {
    title: 'Trusted Experience',
    description: '10+ years of building apartments and villas for Chennai families.',
    image: '/landing/images/intro.jpg',
  },
  {
    title: 'Quality Construction',
    description: 'Sound structure and clean finishes, checked on site at every stage.',
    image: '/landing/images/apartments.jpg',
  },
  {
    title: 'Strategic Locations',
    description: '11 well-connected neighbourhoods, from Ambattur to Anna Nagar.',
    image: '/landing/images/projects.jpg',
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
  '2 BHK Homes',
  '3 BHK Homes',
  'Premium Apartments',
  'Residential Projects',
  'Not sure yet',
] as const;

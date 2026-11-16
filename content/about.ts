export const aboutServices = [
  {
    slug: 'flat-developers',
    title: 'Apartments',
    description: 'Thoughtfully planned 2 & 3 BHK flats in Ambattur and beyond.',
  },
  {
    slug: 'building-contractor',
    title: 'Construction',
    description: 'From your own plot to a home shaped around your plans.',
  },
  {
    slug: 'interior-services',
    title: 'Interiors',
    description: 'Room layouts, materials and finishes that fit your everyday.',
  },
  {
    slug: 'joint-venture',
    title: 'Joint ventures',
    description: 'Explore the residential possibilities for your land.',
  },
] as const;

export const aboutPrinciples = [
  {
    title: 'Designed for daily life',
    description: 'Useful layouts, comfortable living spaces and interiors that work around your routine.',
  },
  {
    title: 'Clarity at every step',
    description: 'Straightforward conversations about your needs, the scope of work and what comes next.',
  },
  {
    title: 'Close to your community',
    description: 'An Ambattur-based team you can meet, with local knowledge and practical guidance.',
  },
] as const;

type LeadershipProfile = {
  name: string;
  role: string;
  portrait: { src: string; alt: string; objectPosition?: string } | null;
};

// Add a director's supplied portrait here when available.
export const aboutLeadership: LeadershipProfile[] = [
  {
    name: 'Saravanan',
    role: 'Managing Director',
    portrait: null,
  },
  {
    name: 'Shanmugam',
    role: 'Managing Director',
    portrait: null,
  },
];

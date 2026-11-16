export type Service = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  includes: string[];
  image: string;
  imageAlt: string;
  cta: { label: string; href: string };
};

export const services: Service[] = [
  {
    slug: "flat-developers",
    title: "Flat development",
    summary: "Thoughtfully planned 2 and 3 BHK apartments in Ambattur and beyond.",
    description: "Explore 2 & 3 BHK flats in Ambattur and other locations.",
    includes: ["Ambattur + 10 locations", "Layouts and site visits"],
    image: "/images/projects/ambattur-flats.webp",
    imageAlt: "SP Properties apartment exterior rendering in Ambattur with balconies and stone finishes",
    cta: { label: "Explore our flats", href: "/projects" },
  },
  {
    slug: "building-contractor",
    title: "House construction",
    summary: "Plan and build your home with a team you can meet.",
    description: "Villa construction in Ambattur, from planning and materials to handover.",
    includes: ["Plot and budget review", "Planning and progress updates"],
    image: "/images/services/apartment-construction-three-floors.webp",
    imageAlt: "Illustration of two engineers reviewing plans in front of a three-floor apartment building under construction, presented by SP Properties, Ambattur",
    cta: { label: "Plan your build", href: "/contact" },
  },
  {
    slug: "interior-services",
    title: "Interior services",
    summary: "Interiors shaped around your home and everyday life.",
    description: "Apartment interior planning in Ambattur, shaped around your style and budget.",
    includes: ["Room layouts", "Materials and finishes"],
    image: "/images/services/interiors.webp",
    imageAlt: "Illustrative interior planning for a practical Indian family living and dining room",
    cta: { label: "Plan your interiors", href: "/contact" },
  },
  {
    slug: "joint-venture",
    title: "Joint ventures",
    summary: "Explore the development possibilities for your land.",
    description: "Explore a residential development partnership for your land in Ambattur and surrounding areas.",
    includes: ["Site feasibility review", "Individual partnership terms"],
    image: "/images/services/jointventure.webp",
    imageAlt: "Illustrative landowner consultation with site drawings and a residential development model",
    cta: { label: "Discuss a joint venture", href: "/contact" },
  },
];

export const process = [
  { title: "Tell us what you need", text: "Location, size and budget, on WhatsApp or the enquiry form." },
  { title: "Get matching options", text: "We share projects that fit your preferred location and flat size." },
  { title: "Visit the site", text: "Meet our team and see the flat in person." },
  { title: "Book your flat", text: "We guide you through the next steps." },
];

export const reasons = [
  { title: "Local to Ambattur", text: "Our office is in Kallikuppam, Ambattur. We know the area." },
  { title: "10 years of experience", text: "A decade of building flats, with roots in Ambattur." },
  { title: "Clear guidance", text: "Get straightforward answers from a team you can meet in person." },
  { title: "Easy to reach", text: "WhatsApp, call or book a site visit, any day." },
];

/** Consultation steps for all four services, without assuming a property purchase. */
export const serviceProcess = [
  { title: "Share your plans", text: "Tell us your location, needs and budget." },
  { title: "Define the scope", text: "Review the site and work involved." },
  { title: "Review the details", text: "Discuss the estimate and next steps." },
  { title: "Get started", text: "Agree on the scope and terms." },
];

export const serviceFaqs = [
  { q: "Can you build a home on my plot?", a: "Yes. Share your plot location in Ambattur or the surrounding areas and requirements so we can discuss house or villa construction." },
  { q: "Can I discuss interiors as a separate service?", a: "Yes. We can discuss room layouts, materials and finishes for your home." },
  { q: "What should I prepare for a joint venture discussion?", a: "Bring your land location, site dimensions and available property documents." },
  { q: "What is the villa construction cost per sq ft in Ambattur?", a: "The estimate depends on your plot, floor area, design and finishes. Share your budget and requirements for a scope-based quote." },
];

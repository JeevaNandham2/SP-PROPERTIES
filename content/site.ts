/** Business facts — single source of truth (from the client's documents). */
export const site = {
  name: "SP Properties",
  tagline: "We Build, What You Love.",
  description:
    "SP Properties is a real estate and construction company in Ambattur, offering flats, villa construction, interiors and joint ventures with 10 years of experience.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://spproperties.co.in").replace(/\/+$/, ""),
  experienceYears: 10,
  market: "Ambattur, Tamil Nadu",
  focusArea: "Ambattur",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919500124126",
  phoneDisplay: "+91 95001 24126",
  phoneHref: "tel:+919500124126",
  email: "sppropertiessp@gmail.com",
  address: {
    line1: "F2, 1st Floor, Balaji Nagar East",
    line2: "Plot No. 229, Devi Apartments, Kallikuppam",
    locality: "Ambattur",
    city: "Chennai",
    region: "Tamil Nadu",
    postalCode: "600053",
    country: "IN",
    full: "F2, 1st Floor, Balaji Nagar East, Plot No. 229, Devi Apartments, Kallikuppam, Ambattur, Tamil Nadu – 600053",
  },
  // TODO(client): confirm exact coordinates from Google Business Profile
  geo: { lat: 13.1143, lng: 80.1548 },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Devi+Apartments+Balaji+Nagar+East+Kallikuppam+Ambattur+Chennai+600053",
  officeHours: "", // Add confirmed business hours when available.
  socials: {
    instagram: "https://www.instagram.com/sp_properties_official/",
    facebook: "", // TODO(client): public Facebook page URL
  },
  credentials: [] as string[], // Only publish confirmed registration and approval details.
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

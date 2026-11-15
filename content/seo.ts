import type { Project } from "./projects";

/** Page intent and search wording. Keywords belong in useful copy, not a meta-keywords tag. */
export const pageSeo = {
  home: {
    title: "Construction Company in Chennai | SP Properties",
    description: "SP Properties is a construction company in Chennai. Explore apartments for sale in Ambattur, 2 & 3 BHK homes, villa construction and interiors.",
    keyword: "construction company in Chennai",
  },
  about: {
    title: "About SP Properties | Builders in Ambattur, Chennai",
    description: "Meet SP Properties, a real estate company in Ambattur with 10 years of experience in Chennai homes, apartment development and house construction.",
    keyword: "builders in Ambattur",
  },
  projects: {
    title: "2 & 3 BHK Flats in Chennai | SP Properties",
    description: "Explore new apartments in Chennai across 11 locations, including Ambattur and Anna Nagar. Ask SP Properties for 2 & 3 BHK floor plans, prices and site visits.",
    keyword: "flats in Chennai",
  },
  services: {
    title: "Building Contractors in Chennai | SP Properties",
    description: "Building contractors in Chennai for house and villa construction, apartment development, interiors and joint ventures. Discuss your plot and budget with us.",
    keyword: "building contractors in Chennai",
  },
  contact: {
    title: "Contact SP Properties | Ambattur Office, Chennai",
    description: "Contact SP Properties in Ambattur for flat prices, floor plans, villa construction or a site visit. Call or WhatsApp +91 95001 24126 to discuss your needs.",
    keyword: "real estate office in Ambattur",
  },
  ambattur: {
    title: "Apartments for Sale in Ambattur | SP Properties",
    description: "Explore residential apartments in Ambattur with SP Properties. Compare 2 & 3 BHK homes, ask about prices and availability, or plan house construction.",
    keyword: "apartments for sale in Ambattur",
  },
  testimonials: {
    title: "SP Properties Client Stories & Testimonials | Chennai",
    description: "Meet the families behind SP Properties, builders in Ambattur, Chennai. Explore client stories and guidance for choosing your 2 or 3 BHK home.",
    keyword: "SP Properties testimonials",
  },
} as const;

export function locationSeo(project: Project) {
  const homes = `${project.configurations.map((c) => c.bhk).join(" & ")} BHK`;
  return {
    title: `${homes} Flats in ${project.location} | SP Properties`,
    description: `Explore ${homes} flats for sale in ${project.location}, Chennai with SP Properties. Request current prices, floor plans, availability and a site visit.`,
    path: `/projects/${project.slug}`,
  };
}

import { projects as projectList, type Project } from "./projects";

/** Page intent and search wording. Keywords belong in useful copy, not a meta-keywords tag. */
export const pageSeo = {
  home: {
    title: "Flats in Ambattur & Construction | SP Properties",
    description: "Explore 2 & 3 BHK flats in Ambattur with SP Properties. Discuss apartments for sale, house construction, interiors and site visits with our local team.",
    keyword: "flats in Ambattur",
  },
  about: {
    title: "About SP Properties | Builders in Ambattur",
    description: "Meet SP Properties, builders in Ambattur with 10 years of experience in flat development, house construction and interiors. Visit our Kallikuppam team.",
    keyword: "builders in Ambattur",
  },
  projects: {
    title: "2 & 3 BHK Flats in Ambattur & Beyond | SP Properties",
    description: `Find 2 & 3 BHK flats in Ambattur and explore ${new Set(projectList.map(project => project.location)).size} locations with SP Properties. Ask our team for availability, floor plans and site visits.`,
    keyword: "2 & 3 BHK flats in Ambattur",
  },
  services: {
    title: "Building Contractors in Ambattur | SP Properties",
    description: "Building contractors in Ambattur for house and villa construction, flat development, interiors and joint ventures. Discuss your plot and budget with our team.",
    keyword: "building contractors in Ambattur",
  },
  contact: {
    title: "Contact SP Properties | Ambattur Office",
    description: "Contact SP Properties in Ambattur for flat prices, floor plans, villa construction or a site visit. Call or WhatsApp +91 95001 24126 to discuss your needs.",
    keyword: "real estate office in Ambattur",
  },
  ambattur: {
    title: "Apartments for Sale in Ambattur | SP Properties",
    description: "Explore residential apartments in Ambattur with SP Properties. Compare 2 & 3 BHK flats, ask about prices and availability, or plan house construction.",
    keyword: "apartments for sale in Ambattur",
  },
  chennai: {
    title: "Flats & Construction in Chennai | SP Properties",
    description: "Explore Chennai flat locations or discuss house construction, interiors and joint ventures with SP Properties. Meet our local team in Ambattur.",
    keyword: "flats and construction in Chennai",
  },
  testimonials: {
    title: "SP Properties Testimonials | Builders in Ambattur",
    description: "Meet the families behind SP Properties, builders in Ambattur. Explore client stories and guidance from our local team for choosing your 2 or 3 BHK flat.",
    keyword: "SP Properties Ambattur testimonials",
  },
} as const;

export function locationSeo(project: Project) {
  const configuration = `${project.configurations.map((c) => c.bhk).join(" & ")} BHK`;
  return {
    title: `${configuration} Flats in ${project.location} | SP Properties`,
    description: `Explore ${configuration} flats in ${project.location} with SP Properties, based in Ambattur. Request current prices, floor plans, availability and a site visit.`,
    path: `/projects/${project.slug}`,
  };
}

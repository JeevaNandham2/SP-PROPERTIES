/** Project locations and home configurations. */
export type Configuration = {
  bhk: 2 | 3;
};

export type Project = {
  slug: string;
  location: string;
  name?: string;
  configurations: Configuration[];
  status?: string;
  featured?: boolean;
  image: string;
  nearby: string[];
};

const cfg = (bhk: 2 | 3): Configuration => ({ bhk });

export const projects: Project[] = [
  { slug: "flats-in-ambattur", location: "Ambattur", configurations: [cfg(2), cfg(3)], featured: true, image: "/images/chennai-homes/ambattur-urban.webp", nearby: ["flats-in-korattur", "flats-in-thirumullaivoyal", "flats-in-annanur"] },
  { slug: "flats-in-thirumullaivoyal", location: "Thirumullaivoyal", configurations: [cfg(2), cfg(3)], image: "/images/chennai-homes/thirumullaivoyal-urban.webp", nearby: ["flats-in-ambattur", "flats-in-annanur", "flats-in-korattur"] },
  { slug: "flats-in-annanur", location: "Annanur", configurations: [cfg(2), cfg(3)], image: "/images/chennai-homes/annanur-v2.webp", nearby: ["flats-in-ambattur", "flats-in-thirumullaivoyal", "flats-in-korattur"] },
  { slug: "flats-in-ayyapakkam", location: "Ayyapakkam", configurations: [cfg(3)], image: "/images/chennai-homes/ayyapakkam-urban.webp", nearby: ["flats-in-ambattur", "flats-in-annanur", "flats-in-thirumullaivoyal"] },
  { slug: "flats-in-perambur", location: "Perambur", configurations: [cfg(2)], image: "/images/chennai-homes/perambur-urban.webp", nearby: ["flats-in-kolathur", "flats-in-anna-nagar", "flats-in-korattur"] },
  { slug: "flats-in-korattur", location: "Korattur", configurations: [cfg(2)], image: "/images/chennai-homes/korattur-urban.webp", nearby: ["flats-in-ambattur", "flats-in-kolathur", "flats-in-anna-nagar"] },
  { slug: "flats-in-kolathur", location: "Kolathur", configurations: [cfg(2), cfg(3)], image: "/images/chennai-homes/kolathur-urban.webp", nearby: ["flats-in-perambur", "flats-in-korattur", "flats-in-anna-nagar"] },
  { slug: "flats-in-anna-nagar", location: "Anna Nagar", configurations: [cfg(3)], image: "/images/chennai-homes/anna-nagar-urban.webp", nearby: ["flats-in-koyambedu", "flats-in-kolathur", "flats-in-maduravoyal"] },
  { slug: "flats-in-maduravoyal", location: "Maduravoyal", configurations: [cfg(2)], image: "/images/chennai-homes/maduravoyal-v2.webp", nearby: ["flats-in-koyambedu", "flats-in-kovur", "flats-in-anna-nagar"] },
  { slug: "flats-in-koyambedu", location: "Koyambedu", configurations: [cfg(2)], image: "/images/chennai-homes/koyambedu-urban.webp", nearby: ["flats-in-anna-nagar", "flats-in-maduravoyal", "flats-in-kovur"] },
  { slug: "flats-in-kovur", location: "Kovur", configurations: [cfg(3)], image: "/images/chennai-homes/kovur-urban.webp", nearby: ["flats-in-maduravoyal", "flats-in-koyambedu", "flats-in-ambattur"] },
];

export const getProject = (slug: string) => projects.find((x) => x.slug === slug);
export const locations = projects.map((x) => x.location);

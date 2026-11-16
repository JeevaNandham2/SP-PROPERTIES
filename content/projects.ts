import projectData from "./projects.data.json";

/** Project locations and home configurations. */
export type Configuration = {
  bhk: 2 | 3;
};

export type ProjectImage = {
  src: string;
  alt: string;
  caption: string;
  kind: "photograph" | "rendering" | "concept" | "inspiration" | "enquiry";
};

export type Project = {
  slug: string;
  location: string;
  name?: string;
  description?: string;
  configurations: Configuration[];
  status?: string;
  featured?: boolean;
  image: string;
  /** Supplied project images, with photographs and renderings identified accurately. */
  gallery?: ProjectImage[];
  nearby: string[];
};

export const projects: Project[] = projectData as Project[];

export const getProject = (slug: string) => projects.find((x) => x.slug === slug);
export const locations = projects.map((x) => x.location);

export function getProjectPreview(project: Project): ProjectImage {
  return project.gallery?.[0] ?? {
    src: project.image,
    alt: `Architectural concept for flats in ${project.location}, presented by SP Properties, Ambattur`,
    caption: "Architectural concept",
    kind: "concept",
  };
}

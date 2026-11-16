import { z } from "zod";

export { CMS_STORE, MANAGED_IMAGE, MAX_UPLOAD_BYTES, MAX_CONTENT_BYTES, projectSlug } from "./constants";
const text = (max: number) => z.string().trim().max(max).refine(value => !/[<>\u0000-\u0008]/.test(value), "Use plain text, without HTML.");
const imagePath = z.string().regex(/^\/images\/[a-zA-Z0-9/_-]+\.(webp|jpe?g|png)$/i, "Choose a project image or upload a JPG, PNG or WebP.");
export const slugSchema = z.string().max(100).regex(/^flats-in-[a-z0-9]+(?:-[a-z0-9]+)*$/, "The address must start with flats-in- and use lowercase words separated by hyphens.");
export const projectSchema = z.object({
  slug: slugSchema,
  location: text(70).min(2, "Enter the project location."),
  name: text(100).optional(),
  description: text(1200).optional(),
  configurations: z.array(z.object({ bhk: z.union([z.literal(2), z.literal(3)]) }).strict()).min(1, "Choose at least one flat type.").max(2),
  status: text(80).optional(),
  featured: z.boolean().optional(),
  image: imagePath,
  gallery: z.array(z.object({
    src: imagePath,
    alt: text(250).min(5, "Describe the image for accessibility and search."),
    caption: text(120).min(1, "Add an image caption."),
    kind: z.enum(["photograph", "rendering", "concept", "inspiration", "enquiry"]),
  }).strict()).min(1, "Add at least one image.").max(8),
  nearby: z.array(slugSchema).max(3),
}).strict();

export type CmsProject = z.infer<typeof projectSchema>;
export const projectsSchema = z.array(projectSchema).min(1).max(100).superRefine((projects, ctx) => {
  const slugs = new Set<string>();
  for (const [index, project] of projects.entries()) {
    if (slugs.has(project.slug)) ctx.addIssue({ code: "custom", path: [index, "slug"], message: "Every project needs a different page address." });
    slugs.add(project.slug);
    if (new Set(project.configurations.map(c => c.bhk)).size !== project.configurations.length) ctx.addIssue({ code: "custom", path: [index, "configurations"], message: "Choose each flat type only once." });
    if (project.image !== project.gallery[0].src) ctx.addIssue({ code: "custom", path: [index, "image"], message: "The first gallery image must be the card image." });
  }
  for (const [index, project] of projects.entries()) {
    if (project.nearby.some(slug => !slugs.has(slug) || slug === project.slug)) ctx.addIssue({ code: "custom", path: [index, "nearby"], message: "Nearby projects must be other existing projects." });
  }
});

export type ContentDocument = { revision: string; updatedAt: string | null; projects: CmsProject[] };
export type CmsState = {
  schemaVersion: 1;
  draft: ContentDocument;
  published: ContentDocument;
  lastPublish?: { revision: string; requestedAt: string; status: "requested" | "queued" | "failed" };
};
export const stateSchema = z.object({
  schemaVersion: z.literal(1),
  draft: z.object({ revision: z.string(), updatedAt: z.string().nullable(), projects: projectsSchema }),
  published: z.object({ revision: z.string(), updatedAt: z.string().nullable(), projects: projectsSchema }),
  lastPublish: z.object({ revision: z.string(), requestedAt: z.string(), status: z.enum(["requested", "queued", "failed"]) }).optional(),
});

export function protectPublishedPages(projects: CmsProject[], published: CmsProject[]) {
  for (const original of published) {
    const current = projects.find(project => project.slug === original.slug);
    if (!current) throw new Error(`Keep the published page /projects/${original.slug}. Published pages cannot be removed or renamed in the editor.`);
    if (current.location !== original.location) throw new Error(`The location for ${original.slug} is locked to protect its search listing. Add a new project for another location.`);
  }
}

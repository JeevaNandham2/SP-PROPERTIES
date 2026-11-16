import { createHash } from "node:crypto";
import { mkdir, writeFile, access } from "node:fs/promises";
import { resolve, relative } from "node:path";
import seed from "../../content/projects.seed.json";
import { MANAGED_IMAGE, projectsSchema, protectPublishedPages, stateSchema } from "../../lib/cms/model";

export async function materializeContent(root: string, store: {
  readState(): Promise<unknown>;
  readImage(key: string): Promise<ArrayBuffer | null>;
}) {
  const raw = await store.readState();
  const seedProjects = projectsSchema.parse(seed);
  const document = raw ? stateSchema.parse(raw).published : { revision: "seed", updatedAt: null, projects: seedProjects };
  protectPublishedPages(document.projects, seedProjects);
  const sourceImages = new Set(seedProjects.flatMap(project => project.gallery.map(image => image.src)));
  const imagePaths = new Set(document.projects.flatMap(project => project.gallery.map(image => image.src)));
  for (const src of imagePaths) {
    const target = resolve(root, "public", src.slice(1));
    if (relative(resolve(root, "public/images"), target).startsWith("..")) throw new Error("Image path leaves the public images folder");
    const key = MANAGED_IMAGE.exec(src)?.[1];
    if (key) {
      const data = await store.readImage(key);
      if (!data || `${createHash("sha256").update(Buffer.from(data)).digest("hex")}.webp` !== key) throw new Error(`Missing or damaged CMS image ${key}`);
      await mkdir(resolve(root, "public/images/managed"), { recursive: true });
      await writeFile(target, new Uint8Array(data));
    } else {
      if (!sourceImages.has(src)) throw new Error("Unrecognized project image");
      await access(target);
    }
  }
  await writeFile(resolve(root, "content/projects.data.json"), JSON.stringify(document.projects, null, 2) + "\n");
  await writeFile(resolve(root, "public/content-version.json"), JSON.stringify({ revision: document.revision, updatedAt: document.updatedAt }) + "\n");
  console.log(`Prepared ${document.projects.length} static project pages from published content (${document.revision}).`);
}

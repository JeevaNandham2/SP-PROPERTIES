import { createHash, randomUUID } from "node:crypto";
import sharp, { type OutputInfo } from "sharp";
import seed from "../../content/projects.seed.json";
import { MANAGED_IMAGE, MAX_CONTENT_BYTES, MAX_UPLOAD_BYTES, projectsSchema, protectPublishedPages, stateSchema, type CmsProject, type CmsState } from "./model";

export interface CmsStore {
  read(): Promise<{ state: CmsState; etag: string } | null>;
  write(state: CmsState, etag?: string): Promise<boolean>;
  readImage(key: string): Promise<ArrayBuffer | null>;
  writeImage(key: string, data: Buffer): Promise<void>;
  snapshot(state: CmsState["published"]): Promise<void>;
}
type IdentityUser = { id: string; email?: string; roles?: string[] } | null;
export type CmsDependencies = {
  getUser: () => Promise<IdentityUser>;
  getStore: () => CmsStore;
  adminEmail?: string;
  buildHook?: string;
  triggerBuild: (url: string, revision: string) => Promise<void>;
};
export const seedProjects = projectsSchema.parse(seed);
export const initialState = (): CmsState => ({ schemaVersion: 1, draft: { revision: "seed", updatedAt: null, projects: seedProjects }, published: { revision: "seed", updatedAt: null, projects: seedProjects } });
const existingImages = new Set(seedProjects.flatMap(project => project.gallery.map(image => image.src)));
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", Vary: "Cookie" };
const json = (data: unknown, status = 200) => Response.json(data, { status, headers });
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function validBuildHook(value?: string) { return !!value && /^https:\/\/api\.netlify\.com\/build_hooks\/[a-f0-9]{24}$/.test(value); }

async function readBody(request: Request, maximum: number) {
  if (Number(request.headers.get("content-length")) > maximum) throw new HttpError(413, "This file or document is too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "The request is empty.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maximum) { await reader.cancel(); throw new HttpError(413, "This file or document is too large."); }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
async function bodyJson(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new HttpError(415, "Send a JSON document.");
  try {
    const value = JSON.parse((await readBody(request, MAX_CONTENT_BYTES)).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
    return value;
  }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "The document is not valid JSON."); }
}
async function ensureImages(projects: CmsProject[], store: CmsStore) {
  const images = new Set(projects.flatMap(project => project.gallery.map(image => image.src)));
  for (const image of images) {
    if (existingImages.has(image)) continue;
    const key = MANAGED_IMAGE.exec(image)?.[1];
    if (!key || !(await store.readImage(key))) throw new HttpError(400, "An image is missing. Upload it again before saving.");
  }
}

export async function handleCmsRequest(request: Request, deps: CmsDependencies): Promise<Response> {
  try {
    if (!deps.adminEmail?.trim()) throw new HttpError(503, "Admin sign-in has not been activated. Complete the Netlify admin setup first.");
    const user = await deps.getUser();
    if (!user) throw new HttpError(401, "Sign in to manage projects.");
    if (user.email?.toLowerCase() !== deps.adminEmail.trim().toLowerCase() || !user.roles?.includes("project-admin")) throw new HttpError(403, "This account does not have project editing access.");
    if (!["GET", "PUT", "POST"].includes(request.method)) throw new HttpError(405, "This method is not supported.");
    const url = new URL(request.url);
    if (request.method !== "GET" && request.headers.get("origin") !== url.origin) throw new HttpError(403, "Open the editor on this website before making changes.");
    const action = url.searchParams.get("action") || "state";
    const store = deps.getStore();
    if (request.method === "GET" && action === "image") {
      const key = url.searchParams.get("key") || "";
      if (!/^[a-f0-9]{64}\.webp$/.test(key)) throw new HttpError(400, "Invalid image.");
      const image = await store.readImage(key);
      if (!image) throw new HttpError(404, "Image not found.");
      return new Response(image, { headers: { ...headers, "Content-Type": "image/webp" } });
    }
    if (request.method === "POST" && action === "upload") {
      if (!["image/jpeg", "image/png", "image/webp"].includes(request.headers.get("content-type") || "")) throw new HttpError(415, "Use a JPG, PNG or WebP image.");
      const input = await readBody(request, MAX_UPLOAD_BYTES);
      let output: { data: Buffer; info: OutputInfo };
      try {
        const pipeline = sharp(input, { limitInputPixels: 25_000_000, failOn: "warning" });
        const info = await pipeline.metadata();
        if (!["jpeg", "png", "webp"].includes(info.format || "") || (info.pages || 1) > 1 || (info.width || 0) < 300 || (info.height || 0) < 300) throw new Error("Unsupported image");
        output = await pipeline.rotate().resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });
      } catch { throw new HttpError(400, "Choose a valid, non-animated project image at least 300 × 300 pixels and below 25 megapixels."); }
      const key = `${createHash("sha256").update(output.data).digest("hex")}.webp`;
      await store.writeImage(key, output.data);
      return json({ src: `/images/managed/${key}`, width: output.info.width, height: output.info.height, bytes: output.data.length });
    }
    const record = await store.read();
    const state = record ? stateSchema.parse(record.state) : initialState();
    const response = (value: CmsState) => ({ ...value, email: user.email, canPublish: validBuildHook(deps.buildHook) });
    if (request.method === "GET" && action === "state") return json(response(state));
    if (request.method === "PUT" && action === "state") {
      const body = await bodyJson(request);
      if (body.baseRevision !== state.draft.revision) throw new HttpError(409, "Projects changed in another tab. Reload the latest draft before saving.");
      const parsed = projectsSchema.safeParse(body.projects);
      if (!parsed.success) throw new HttpError(400, parsed.error.issues.map(issue => `Project ${Number(issue.path[0]) + 1}: ${issue.message}`).slice(0, 4).join(" "));
      try { protectPublishedPages(parsed.data, state.published.projects); } catch (error) { throw new HttpError(400, (error as Error).message); }
      await ensureImages(parsed.data, store);
      const next: CmsState = { ...state, draft: { revision: randomUUID(), updatedAt: new Date().toISOString(), projects: parsed.data } };
      if (!(await store.write(next, record?.etag))) throw new HttpError(409, "Another save completed first. Reload the latest draft before saving.");
      return json(response(next));
    }
    if (request.method === "POST" && action === "publish") {
      if (!validBuildHook(deps.buildHook)) throw new HttpError(503, "Publishing needs a Netlify build hook. Your saved draft is safe.");
      const body = await bodyJson(request);
      if (body.revision !== state.draft.revision) throw new HttpError(409, "Save or reload the latest draft before publishing.");
      await ensureImages(state.draft.projects, store);
      await store.snapshot(state.draft);
      const next: CmsState = { ...state, published: state.draft, lastPublish: { revision: state.draft.revision, requestedAt: new Date().toISOString(), status: "requested" } };
      if (!(await store.write(next, record?.etag))) throw new HttpError(409, "Another change completed first. Reload before publishing.");
      let status: "queued" | "failed" = "queued";
      try { await deps.triggerBuild(deps.buildHook!, state.draft.revision); } catch { status = "failed"; }
      // Only update the status of this request; never overwrite a newer draft or publish.
      for (let attempt = 0; attempt < 3; attempt++) {
        const latest = await store.read();
        if (!latest?.state.lastPublish || latest.state.lastPublish.revision !== next.lastPublish?.revision) break;
        const updated: CmsState = { ...latest.state, lastPublish: { ...latest.state.lastPublish, status } };
        if (await store.write(updated, latest.etag)) break;
      }
      if (status === "failed") throw new HttpError(502, "The draft is saved, but Netlify could not queue the build. Retry publishing; the current live website is still available.");
      return json({ revision: state.draft.revision, status: "queued" }, 202);
    }
    throw new HttpError(404, "Editor action not found.");
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    // Do not expose SDK errors, storage credentials, build hooks or stack traces.
    console.error("Project editor request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "The editor could not complete this request. Your live website has not been replaced. Please try again." }, 500);
  }
}

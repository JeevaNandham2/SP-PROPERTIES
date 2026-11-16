import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import sharp from "sharp";
import { handleCmsRequest, initialState, type CmsDependencies, type CmsStore } from "../lib/cms/service";
import { type CmsState, MAX_UPLOAD_BYTES } from "../lib/cms/model";
import { materializeContent } from "../plugins/project-content/materialize";

class MemoryStore implements CmsStore {
  state: CmsState | null = null;
  version = 0;
  images = new Map<string, ArrayBuffer>();
  snapshots = new Map<string, CmsState["published"]>();
  failNextWrite = false;
  async read() { return this.state ? { state: structuredClone(this.state), etag: String(this.version) } : null; }
  async write(state: CmsState, etag?: string) {
    if (this.failNextWrite) { this.failNextWrite = false; return false; }
    if (this.state ? etag !== String(this.version) : etag !== undefined) return false;
    this.state = structuredClone(state); this.version++; return true;
  }
  async readImage(key: string) { return this.images.get(key) || null; }
  async writeImage(key: string, data: Buffer) { this.images.set(key, new Uint8Array(data).buffer); }
  async snapshot(document: CmsState["published"]) { this.snapshots.set(document.revision, structuredClone(document)); }
}
function setup() {
  const store = new MemoryStore();
  const calls: string[] = [];
  const deps: CmsDependencies = {
    adminEmail: "editor@example.com", buildHook: "https://api.netlify.com/build_hooks/1234567890abcdef12345678",
    getUser: async () => ({ id: "user-one", email: "editor@example.com", roles: ["project-admin"] }),
    getStore: () => store, triggerBuild: async (_url, revision) => { calls.push(revision); },
  };
  return { store, deps, calls };
}
const request = (method = "GET", data?: unknown, action = "state", origin = "https://example.com") => new Request(`https://example.com/.netlify/functions/project-admin?action=${action}`, {
  method, headers: { Origin: origin, "Content-Type": "application/json" }, ...(data === undefined ? {} : { body: JSON.stringify(data) }),
});

test("CMS denies anonymous, wrong email and wrong role before touching storage", async () => {
  const { deps } = setup(); let reads = 0;
  deps.getStore = () => { reads++; throw new Error("must not access"); };
  deps.getUser = async () => null;
  assert.equal((await handleCmsRequest(request(), deps)).status, 401);
  deps.getUser = async () => ({ id: "other", email: "stranger@example.com", roles: ["project-admin"] });
  assert.equal((await handleCmsRequest(request(), deps)).status, 403);
  deps.getUser = async () => ({ id: "user-one", email: "editor@example.com", roles: ["admin"] });
  assert.equal((await handleCmsRequest(request(), deps)).status, 403);
  deps.adminEmail = "";
  assert.equal((await handleCmsRequest(request(), deps)).status, 503);
  assert.equal(reads, 0);
});

test("CMS prevents cross-origin writes and protects all private responses from caching and indexing", async () => {
  const { deps, store } = setup();
  const response = await handleCmsRequest(request("PUT", {}, "state", "https://attacker.example"), deps);
  assert.equal(response.status, 403);
  assert.match(response.headers.get("cache-control")!, /no-store/);
  assert.match(response.headers.get("x-robots-tag")!, /noindex/);
  assert.equal(store.state, null);
  assert.equal((await handleCmsRequest(request("PUT", {}, "state", "null"), deps)).status, 403);
  assert.equal((await handleCmsRequest(request("DELETE"), deps)).status, 405);
});

test("CMS saves durable drafts, preserves published data and detects concurrent saves", async () => {
  const { deps, store } = setup();
  const projects = structuredClone(initialState().draft.projects);
  projects[0].description = "A brighter home in Ambattur.";
  const response = await handleCmsRequest(request("PUT", { baseRevision: "seed", projects }), deps);
  assert.equal(response.status, 200);
  const saved = await response.json();
  assert.notEqual(saved.draft.revision, "seed");
  assert.equal(store.state?.draft.projects[0].description, projects[0].description);
  assert.equal(store.state?.published.projects[0].description, undefined);
  assert.equal((await handleCmsRequest(request("PUT", { baseRevision: "seed", projects }), deps)).status, 409);
  store.failNextWrite = true;
  assert.equal((await handleCmsRequest(request("PUT", { baseRevision: saved.draft.revision, projects }), deps)).status, 409);
  const reopened = await (await handleCmsRequest(request(), deps)).json();
  assert.equal(reopened.draft.projects[0].description, projects[0].description);
});

test("published URLs and locations cannot be removed or changed; markup and invalid images are rejected", async () => {
  for (const mutate of [
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].slug = "flats-in-renamed"; p.forEach(project => project.nearby = []); },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].location = "New location"; },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p.pop(); p.forEach(project => project.nearby = []); },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].name = "<script>alert(1)</script>"; },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].image = p[0].gallery[0].src = "/images/../../secret.png"; },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].image = p[0].gallery[0].src = "/images/missing.webp"; },
    (p: ReturnType<typeof initialState>["draft"]["projects"]) => { p[0].configurations = []; },
  ]) {
    const { deps, store } = setup(); const projects = structuredClone(initialState().draft.projects);
    mutate(projects);
    assert.equal((await handleCmsRequest(request("PUT", { baseRevision: "seed", projects }), deps)).status, 400);
    assert.equal(store.state, null);
  }
});

test("uploaded images are converted, stripped, fingerprinted and persisted, while invalid files are rejected", async () => {
  const { deps, store } = setup();
  const bytes = await sharp({ create: { width: 2100, height: 2200, channels: 3, background: "#e4c654" } }).jpeg().toBuffer();
  const upload = (body: Uint8Array, type = "image/jpeg") => new Request("https://example.com/.netlify/functions/project-admin?action=upload", { method: "POST", headers: { Origin: "https://example.com", "Content-Type": type }, body: new Uint8Array(body).buffer });
  const response = await handleCmsRequest(upload(bytes), deps);
  assert.equal(response.status, 200);
  const image = await response.json();
  assert.match(image.src, /^\/images\/managed\/[a-f0-9]{64}\.webp$/);
  assert.ok(image.width <= 1600 && image.height <= 2000);
  const output = store.images.get(image.src.split("/").at(-1))!;
  assert.equal((await sharp(Buffer.from(output)).metadata()).format, "webp");
  assert.equal((await sharp(Buffer.from(output)).metadata()).exif, undefined);
  assert.equal((await handleCmsRequest(upload(Buffer.from("<svg></svg>")), deps)).status, 400);
  assert.equal((await handleCmsRequest(upload(bytes, "image/svg+xml"), deps)).status, 415);
  assert.equal((await handleCmsRequest(upload(Buffer.alloc(MAX_UPLOAD_BYTES + 1)), deps)).status, 413);
  const source = new URL("https://example.com/.netlify/functions/project-admin?action=image");
  source.searchParams.set("key", image.src.split("/").at(-1));
  assert.equal((await handleCmsRequest(new Request(source), deps)).status, 200);
  deps.getUser = async () => null;
  assert.equal((await handleCmsRequest(new Request(source), deps)).status, 401);
});

test("new cards publish with existing URLs intact, immutable snapshots and an explicit queued state", async () => {
  const { deps, store, calls } = setup();
  const projects = structuredClone(initialState().draft.projects);
  projects.push({ ...structuredClone(projects[0]), slug: "flats-in-pudur", location: "Pudur", name: "SP Garden", description: "Homes near the park.", nearby: [projects[0].slug] });
  const saved = await (await handleCmsRequest(request("PUT", { baseRevision: "seed", projects }), deps)).json();
  const response = await handleCmsRequest(request("POST", { revision: saved.draft.revision }, "publish"), deps);
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { revision: saved.draft.revision, status: "queued" });
  assert.equal(store.state?.published.projects.length, 12);
  assert.equal(store.state?.lastPublish?.status, "queued");
  assert.equal(store.snapshots.get(saved.draft.revision)?.projects.length, 12);
  assert.deepEqual(calls, [saved.draft.revision]);
  assert.equal((await handleCmsRequest(request("POST", { revision: "stale" }, "publish"), deps)).status, 409);
});

test("failed or missing build hooks do not report live success or discard saved drafts", async () => {
  const { deps, store } = setup();
  deps.buildHook = undefined;
  assert.equal((await handleCmsRequest(request("POST", { revision: "seed" }, "publish"), deps)).status, 503);
  assert.equal(store.state, null);
  deps.buildHook = "https://api.netlify.com/build_hooks/1234567890abcdef12345678";
  deps.triggerBuild = async () => { throw new Error("offline"); };
  const response = await handleCmsRequest(request("POST", { revision: "seed" }, "publish"), deps);
  assert.equal(response.status, 502);
  const saved = await store.read();
  assert.equal(saved?.state.lastPublish?.status, "failed");
  assert.equal(saved?.state.draft.projects.length, 11);
  deps.buildHook = "https://attacker.example/steal";
  assert.equal((await handleCmsRequest(request("POST", { revision: "seed" }, "publish"), deps)).status, 503);
});

test("materialization exports only published content and rejects damaged uploads without replacing content", async () => {
  const workspace = process.cwd();
  await mkdir(resolve(workspace, "tmp"), { recursive: true });
  const root = await mkdtemp(resolve(workspace, "tmp/cms-test-"));
  try {
    await mkdir(resolve(root, "content")); await mkdir(resolve(root, "public/images/projects"), { recursive: true });
    const state = initialState();
    for (const image of state.published.projects.flatMap(project => project.gallery)) await writeFile(resolve(root, "public", image.src.slice(1)), "seed fixture");
    state.draft = { ...structuredClone(state.draft), revision: "private-draft" };
    state.draft.projects[0].description = "Private unpublished content";
    const image = Buffer.from("published image fixture");
    const key = createHash("sha256").update(image).digest("hex") + ".webp";
    state.published = { ...structuredClone(state.published), revision: "published-content" };
    state.published.projects[0].image = state.published.projects[0].gallery[0].src = `/images/managed/${key}`;
    const store = { readState: async () => state, readImage: async () => new Uint8Array(image).buffer };
    await materializeContent(root, store);
    const content = await readFile(resolve(root, "content/projects.data.json"), "utf8");
    assert.ok(!content.includes("Private unpublished content"));
    assert.ok(content.includes(key));
    assert.equal(JSON.parse(await readFile(resolve(root, "public/content-version.json"), "utf8")).revision, "published-content");
    assert.equal(await readFile(resolve(root, `public/images/managed/${key}`), "utf8"), image.toString());
    await assert.rejects(materializeContent(root, { ...store, readImage: async () => new ArrayBuffer(0) }), /Missing or damaged/);
    assert.equal(await readFile(resolve(root, "content/projects.data.json"), "utf8"), content);
  } finally {
    // The test created this exact temporary folder beneath the current workspace.
    assert.ok(root.startsWith(resolve(workspace, "tmp") + sep));
    await rm(root, { recursive: true, force: true });
  }
});

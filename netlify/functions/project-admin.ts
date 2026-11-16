import { getUser } from "@netlify/identity";
import { getStore } from "@netlify/blobs";
import { CMS_STORE, type CmsState } from "../../lib/cms/model";
import { handleCmsRequest, type CmsStore } from "../../lib/cms/service";

function contentStore(): CmsStore {
  const store = getStore({ name: CMS_STORE, consistency: "strong" });
  return {
    async read() {
      const result = await store.getWithMetadata("state", { type: "json" });
      if (result && !result.etag) throw new Error("Content revision is missing");
      return result ? { state: result.data as CmsState, etag: result.etag! } : null;
    },
    async write(state, etag) {
      const result = await store.setJSON("state", state, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
      return result.modified;
    },
    readImage: key => store.get(`images/${key}`, { type: "arrayBuffer" }),
    async writeImage(key, data) { await store.set(`images/${key}`, new Uint8Array(data).buffer, { onlyIfNew: true }); },
    async snapshot(document) { await store.setJSON(`revisions/${document.revision}`, document, { onlyIfNew: true }); },
  };
}

const handler = async (request: Request) => handleCmsRequest(request, {
  getUser,
  getStore: contentStore,
  adminEmail: process.env.CMS_ADMIN_EMAIL || "sppropertiessp@gmail.com",
  buildHook: process.env.CMS_BUILD_HOOK,
  async triggerBuild(url, revision) {
    const hook = new URL(url);
    hook.searchParams.set("trigger_title", `Publish project content ${revision.slice(0, 8)}`);
    const response = await fetch(hook, { method: "POST", body: JSON.stringify({ cmsRevision: revision }), headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(10_000), redirect: "error" });
    if (!response.ok) throw new Error("Build request rejected");
  },
});
export default handler;

import { getStore } from "@netlify/blobs";
import { tsImport } from "tsx/esm/api";

export async function onPreBuild({ netlifyConfig }) {
  if (process.env.CMS_ENABLED !== "true") return;
  const { materializeContent } = await tsImport("./materialize.ts", import.meta.url);
  const store = getStore({ name: "sp-properties-projects-v1", consistency: "strong" });
  await materializeContent(process.cwd(), {
    readState: () => store.get("state", { type: "json" }),
    readImage: key => store.get(`images/${key}`, { type: "arrayBuffer" }),
  });
  netlifyConfig.build.environment.CMS_CONTENT_PREPARED = "true";
}

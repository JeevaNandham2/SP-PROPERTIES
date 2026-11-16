import { copyFile, writeFile, access } from "node:fs/promises";

if (process.env.CMS_CONTENT_PREPARED === "true") {
  await access("content/projects.data.json");
  await access("public/content-version.json");
} else {
  // Local/manual builds use the reviewed repository content. Netlify's plugin
  // replaces this with the published CMS snapshot before the production build.
  if (process.env.NETLIFY === "true" && process.env.CMS_ENABLED === "true") throw new Error("The CMS build plugin did not prepare content. Refusing to replace published projects with seed data.");
  await copyFile("content/projects.seed.json", "content/projects.data.json");
  await writeFile("public/content-version.json", JSON.stringify({ revision: "seed", updatedAt: null }) + "\n");
}

import { build } from "esbuild";
import { mkdir, readFile, writeFile, readdir, unlink } from "node:fs/promises";
import { resolve, relative } from "node:path";

const output = resolve("public/admin");
if (relative(process.cwd(), output).replaceAll("\\", "/") !== "public/admin") throw new Error("Invalid admin output directory");
await mkdir(output, { recursive: true });
// Only remove files emitted by this builder; never recursively remove a folder.
for (const name of await readdir(output)) if (/^admin-[A-Z0-9]+\.(js|css)$/.test(name)) await unlink(resolve(output, name));
const result = await build({
  entryPoints: ["admin/main.tsx"], outdir: output, bundle: true, minify: true,
  platform: "browser", format: "esm", target: ["es2020"], jsx: "automatic",
  entryNames: "admin-[hash]", metafile: true, legalComments: "none",
  loader: { ".ttf": "file" }, assetNames: "font-[hash]",
  define: { "process.env.NODE_ENV": '"production"' },
});
const emitted = Object.keys(result.metafile.outputs);
const js = emitted.find(file => file.endsWith(".js"));
const css = emitted.find(file => file.endsWith(".css"));
if (!js || !css) throw new Error("Admin assets were not built");
const url = file => "/" + relative(resolve("public"), resolve(file)).replaceAll("\\", "/");
const html = (await readFile("admin/index.html", "utf8")).replace("{{SCRIPT}}", url(js)).replace("{{STYLE}}", url(css));
await writeFile(resolve(output, "index.html"), html);
console.log("React project editor built separately from the public website.");

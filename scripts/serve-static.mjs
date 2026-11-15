import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    hostname: { type: "string", default: "127.0.0.1" },
    port: { type: "string", default: process.env.PORT || "3000" },
  },
});
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Use a port between 1 and 65535.");

const root = fileURLToPath(new URL("../dist/", import.meta.url));
try {
  await stat(resolve(root, "index.html"));
} catch {
  console.error("The dist folder is missing. Run npm run build first.");
  process.exit(1);
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

async function findFile(pathname) {
  if (!pathname.startsWith("/") || pathname.startsWith("//") || /[\\\0]/.test(pathname)) return null;
  const target = resolve(root, `.${pathname}`);
  const local = relative(root, target);
  if (local === ".." || local.startsWith(`..${sep}`) || local.split(sep).some(part => part.startsWith("."))) return null;
  const candidates = local ? [target, `${target}.html`, resolve(target, "index.html")] : [resolve(root, "index.html")];
  for (const candidate of candidates) {
    try { if ((await stat(candidate)).isFile()) return candidate; }
    catch (error) { if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error; }
  }
  return null;
}

const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const url = new URL(request.url, "http://localhost");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/.netlify/images") {
      // Netlify performs resizing in production; this local preview serves the
      // original deployed image without requiring an account or a network call.
      const source = url.searchParams.get("url") || "";
      if (!source.startsWith("/") || source.startsWith("//") || !/\.(png|jpe?g|webp|avif|gif)$/i.test(source)) {
        response.writeHead(400).end("Expected a local image path.");
        return;
      }
      pathname = decodeURIComponent(source);
    }
    const found = await findFile(pathname);
    const file = found || resolve(root, "404.html");
    const body = await readFile(file);
    const contentType = found && pathname === "/opengraph-image" ? "image/png" : types[extname(file)] || "application/octet-stream";
    response.writeHead(found ? 200 : 404, {
      "Content-Type": contentType,
      "Content-Length": body.length,
      "Cache-Control": "no-cache",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 500).end("Unable to serve this request.");
  }
});

server.on("error", error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, values.hostname, () => {
  console.log(`Static preview: http://${values.hostname}:${port}`);
  console.log("Serving dist. Netlify image transformations use original images in this local preview.");
});

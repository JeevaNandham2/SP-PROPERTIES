import { access, copyFile } from "node:fs/promises";
try { await access("content/projects.data.json"); }
catch { await copyFile("content/projects.seed.json", "content/projects.data.json"); }

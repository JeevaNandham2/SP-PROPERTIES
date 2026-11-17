import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified until genuine per-page update dates are tracked.
  const pages = ["", "/about", "/projects", "/services", "/testimonials", "/contact", "/ambattur", "/chennai"].map((p) => ({
    url: `${site.url}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : p === "/ambattur" || p === "/projects" ? 0.9 : 0.7,
  }));
  const locs = projects.map((p) => ({ url: `${site.url}/projects/${p.slug}`, changeFrequency: "weekly" as const, priority: p.featured ? 0.9 : 0.8 }));
  return [...pages, ...locs];
}

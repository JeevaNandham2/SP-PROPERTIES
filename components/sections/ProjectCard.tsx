import { TiltCard } from "@/components/animations/TiltCard";
import Image from "next/image";
import Link from "next/link";
import { getProjectPreview, type Project } from "@/content/projects";
import { btn } from "@/components/ui/Button";
import { waLink } from "@/lib/whatsapp";

export function ProjectCard({ project, priority = false }: { project: Project; priority?: boolean }) {
  const preview = getProjectPreview(project);
  return (
    <TiltCard className="h-full"><article data-reveal className="project-card group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition hover:border-navy">
      <div className="relative aspect-[4/3] overflow-hidden bg-soft">
        <Image
          src={preview.src}
          alt={preview.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain"
        />
        {project.featured && <span className="absolute left-3.5 top-3.5 rounded-sm bg-gold px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-navy">Featured</span>}
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <span className="self-start rounded-sm bg-soft px-2.5 py-1 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-navy">
          {project.configurations.map((c) => `${c.bhk} BHK`).join(" · ")}
        </span>
        <h3 className="mb-0.5 mt-2.5 font-display text-[30px] font-medium text-ink">{project.location}</h3>
        <p className="mb-3.5 text-sm text-muted">{project.name ? project.name : "SP Properties · Ambattur"}</p>
        {project.description && <p className="mb-3.5 text-sm text-muted">{project.description}</p>}
        <p className="mt-2 border-t border-line pt-3 text-xs text-muted">{preview.caption}</p>
        <div className="mt-auto flex flex-wrap gap-2.5 pt-4">
          <Link href={`/projects/${project.slug}`} className={btn("navy", "min-h-[44px] px-[18px] text-[11.5px]")}>
            View details<span className="sr-only"> for {project.location}</span>
          </Link>
          <a
            href={waLink(`Hi SP Properties, I'm interested in flats in ${project.location}. Please share details.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={btn("outline", "min-h-[44px] px-[18px] text-[11.5px]")}
          >
            Enquire<span className="sr-only"> about {project.location} on WhatsApp</span>
          </a>
        </div>
      </div>
    </article></TiltCard>
  );
}

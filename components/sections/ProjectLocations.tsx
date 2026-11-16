import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { projects } from "@/content/projects";
import { Container, SectionHeader } from "@/components/ui/SectionHeader";

export function ProjectLocations() {
  return (
    <section data-landing-motion id="project-locations" className="bg-soft py-20 md:py-28">
      <Container>
        <div data-reveal className="mb-10 grid items-end gap-6 lg:grid-cols-2">
          <SectionHeader eyebrow="Our project locations" title={<>Ambattur & beyond.<br /><em className="font-normal">Close to your life.</em></>} />
          <p className="max-w-lg">Explore 2 &amp; 3 BHK flats across these {projects.length} neighbourhoods, with Ambattur at the heart of our work. Choose a location to see its flat configurations and enquire about availability.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <li key={project.slug} data-reveal data-reveal-delay={index % 4}>
              <Link href={`/projects/${project.slug}`} className="location-link">
                <MapPin size={18} aria-hidden="true" />
                <span>{project.location}<small>{project.configurations.map((configuration) => `${configuration.bhk} BHK`).join(" / ")}</small></span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

import type { Location } from '../types';
import { projects, getProjectPreview } from '@/content/projects';

// Preserve the established deck order and include new projects added in the editor.
const locationOrder = ['ambattur', 'anna-nagar', 'kolathur', 'thirumullaivoyal', 'annanur', 'ayyapakkam', 'perambur', 'korattur', 'maduravoyal', 'koyambedu', 'kovur'];
const order = (slug: string) => {
  const index = locationOrder.indexOf(slug.replace(/^flats-in-/, ''));
  return index < 0 ? locationOrder.length : index;
};

// All card content comes from the same published CMS snapshot as project pages.
export const locations: Location[] = [...projects].sort((a, b) => order(a.slug) - order(b.slug)).map((project) => {
  const preview = getProjectPreview(project);
  return { slug: project.slug.replace(/^flats-in-/, ''), name: project.name || project.location, location: project.location, configurations: project.configurations, image: preview.src, imageAlt: preview.alt };
});

export const getLocation = (slug: string) => locations.find((l) => l.slug === slug);

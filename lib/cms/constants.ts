export const CMS_STORE = "sp-properties-projects-v1";
export const MANAGED_IMAGE = /^\/images\/managed\/([a-f0-9]{64}\.webp)$/;
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_CONTENT_BYTES = 512 * 1024;

export function projectSlug(location: string) {
  return `flats-in-${location.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

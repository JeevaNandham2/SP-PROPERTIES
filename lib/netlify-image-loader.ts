import type { ImageLoaderProps } from "next/image";

/** Keep responsive image delivery when the site is uploaded as static files. */
export default function netlifyImageLoader({ src, width, quality }: ImageLoaderProps) {
  // SVGs are already scalable and should be served directly.
  if (src.split("?")[0].toLowerCase().endsWith(".svg")) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}&fm=webp`;
}

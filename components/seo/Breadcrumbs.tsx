import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] tracking-[0.08em] text-mist">
        <ol className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <li key={it.path} className="flex gap-2">
              {i < items.length - 1 ? (
                <>
                  <Link href={it.path} className="text-white underline-offset-4 hover:underline">{it.name}</Link>
                  <span aria-hidden>/</span>
                </>
              ) : (
                <span aria-current="page">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbSchema(items)} />
    </>
  );
}

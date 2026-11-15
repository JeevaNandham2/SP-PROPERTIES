import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "navy" | "outline" | "outline-light";

const styles: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:bg-gold-hover",
  navy: "bg-navy text-white hover:bg-navy-dark",
  outline: "border border-navy text-navy hover:bg-navy hover:text-white",
  "outline-light": "border border-white text-white hover:bg-white hover:text-navy",
};

const base =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full px-7 text-[12.5px] font-semibold uppercase tracking-[0.2em] transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

export function btn(variant: Variant = "gold", extra = "") {
  return `${base} ${styles[variant]} ${extra}`;
}

type LinkBtnProps = { href: string; variant?: Variant; children: ReactNode; className?: string; external?: boolean };

export function ButtonLink({ href, variant = "gold", children, className = "", external }: LinkBtnProps) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={btn(variant, className)}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={btn(variant, className)}>
      {children}
    </Link>
  );
}

export function Button({ variant = "gold", className = "", ...rest }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={btn(variant, className)} {...rest} />;
}

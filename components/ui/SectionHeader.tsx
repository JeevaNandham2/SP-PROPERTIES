import type { ReactNode } from "react";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`mb-4 flex items-center gap-3 text-eyebrow uppercase ${light ? "text-mist" : "text-muted"}`}>
      <span aria-hidden className="h-[3px] w-7 flex-none bg-gold" />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  light = false,
  as: Tag = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  light?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <Tag className={`font-display text-[clamp(34px,4.2vw,56px)] font-medium leading-[1.05] ${light ? "text-white" : "text-ink"}`}>{title}</Tag>
      {intro && <p className={`mt-5 max-w-[620px] text-lg ${light ? "text-mist" : ""}`}>{intro}</p>}
    </div>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-container px-5 md:px-12 ${className}`}>{children}</div>;
}

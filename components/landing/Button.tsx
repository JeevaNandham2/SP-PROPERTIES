import type { ComponentProps, ReactNode } from "react";
import { Button as CurrentButton, ButtonLink as CurrentButtonLink } from "@/components/ui/Button";
import { Icon } from "./Icon";

type Common = {
  variant?: "gold" | "navy" | "ghost";
  size?: "md" | "sm";
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({ variant = "gold", size = "md", arrow, children, className = "", ...props }: Common & Omit<ComponentProps<"button">, "size">) {
  return (
    <CurrentButton variant={variant === "ghost" ? "outline-light" : variant} className={`btn btn--${variant} ${size === "sm" ? "btn--sm" : ""} ${className}`} {...props}>
      {children}{arrow && <Icon name="arrow" size={16} />}
    </CurrentButton>
  );
}

export function ButtonLink({ variant = "gold", size = "md", arrow, children, className = "", href }: Common & { href: string }) {
  return (
    <CurrentButtonLink href={href} external={href.startsWith("http")} variant={variant === "ghost" ? "outline-light" : variant} className={`btn btn--${variant} ${size === "sm" ? "btn--sm" : ""} ${className}`}>
      {children}{arrow && <Icon name="arrow" size={16} />}
    </CurrentButtonLink>
  );
}

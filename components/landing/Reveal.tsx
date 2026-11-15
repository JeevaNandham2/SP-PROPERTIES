"use client";

import type { ElementType, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  delay?: 0 | 1 | 2 | 3;
}

/** Fades + lifts children in when scrolled into view. Images with `.wipe` are wiped in. */
export function Reveal({ as: Tag = 'div', delay = 0, className, ...rest }: Props) {
  return (
    <Tag
      data-reveal=""
      data-reveal-delay={delay}
      className={['rv', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

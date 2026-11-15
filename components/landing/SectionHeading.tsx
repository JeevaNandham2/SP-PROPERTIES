import type { ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: ReactNode;
  id?: string;
  as?: 'h1' | 'h2';
  aside?: ReactNode;
  className?: string;
}

/** Eyebrow label + serif heading, with optional supporting copy on the right. */
export function SectionHeading({ eyebrow, title, id, as: Tag = 'h2', aside, className }: Props) {
  return (
    <div className={['shead', className].filter(Boolean).join(' ')}>
      <div>
        <p className="lbl">{eyebrow}</p>
        <Tag className="h2" id={id} style={{ marginTop: 18 }}>
          {title}
        </Tag>
      </div>
      {aside && <div className="shead__aside">{aside}</div>}
    </div>
  );
}

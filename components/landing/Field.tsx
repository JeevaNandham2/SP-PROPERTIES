import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  full?: boolean;
  children: ReactNode;
}

export function Field({ id, label, optional, error, full, children }: Props) {
  return (
    <div className={['f', full && 'f--full'].filter(Boolean).join(' ')}>
      <label htmlFor={id}>
        {label} {optional && <em>(optional)</em>}
      </label>
      {children}
      {error && (
        <span className="f__err" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

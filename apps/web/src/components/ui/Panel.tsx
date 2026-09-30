import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  /** `critical` for warnings, `uncertain` for the unknown/uncertain block. */
  emphasis?: 'critical' | 'uncertain';
  aside?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, emphasis, aside, children }: PanelProps) {
  const headingId = `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section
      className={`d-panel${emphasis ? ` d-panel--${emphasis}` : ''}`}
      aria-labelledby={headingId}
    >
      <header className="d-panel__header">
        <h2 id={headingId} className="d-panel__title">
          {title}
        </h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

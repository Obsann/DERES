import type { ReactNode } from 'react';

interface PlaceholderPageProps {
  title: string;
  purpose: string;
  task: string;
  children?: ReactNode;
}

/**
 * Temporary screen shell used until Samuel's UX and Melkamu Tasks 20/23 land.
 * Keeps every primary route renderable without inventing final UI.
 */
export function PlaceholderPage({ title, purpose, task, children }: PlaceholderPageProps) {
  return (
    <main
      style={{
        maxWidth: '40rem',
        margin: '0 auto',
        padding: '2rem 1.25rem 3rem',
      }}
    >
      <p
        style={{
          margin: '0 0 0.5rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          opacity: 0.7,
        }}
      >
        VoiceSOS · scaffold
      </p>
      <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.75rem', lineHeight: 1.2 }}>{title}</h1>
      <p style={{ margin: '0 0 1rem' }}>{purpose}</p>
      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.75 }}>Owned by: {task}</p>
      {children ? <div style={{ marginTop: '1.5rem' }}>{children}</div> : null}
    </main>
  );
}

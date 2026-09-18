import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { routes } from '@/routes/paths';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  padding: '0.35rem 0.65rem',
  borderRadius: '0.35rem',
  textDecoration: 'none',
  background: isActive ? '#1f3d32' : 'transparent',
  color: isActive ? '#f3f1eb' : 'inherit',
});

/**
 * Temporary navigation so the team can click through every primary route.
 * Samuel's design system will replace this chrome in Tasks 31–33.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid rgba(20, 32, 26, 0.12)',
          background: '#ebe7de',
        }}
      >
        <strong>VoiceSOS</strong>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }} aria-label="Primary">
          <NavLink to={routes.home} style={linkStyle} end>
            Start
          </NavLink>
          <NavLink to={routes.emergency.language} style={linkStyle}>
            Language
          </NavLink>
          <NavLink to={routes.emergency.session} style={linkStyle}>
            Session
          </NavLink>
          <NavLink to={routes.responder.list} style={linkStyle}>
            Responder
          </NavLink>
        </nav>
      </header>
      {children}
    </div>
  );
}

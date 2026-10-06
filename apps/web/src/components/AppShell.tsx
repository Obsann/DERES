import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from '@/routes/paths';

/**
 * Bystander screens own their chrome (Brand + Call 907). Responder screens
 * use ResponderShell. This wrapper only locks emergency copy against Translate.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const bystander = pathname === routes.home || pathname.startsWith('/emergency');

  if (bystander) {
    return (
      <div className="notranslate min-h-dvh" translate="no">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from '@/routes/paths';

/** Full-width desktop canvas. Stacks on small screens instead of staying a phone column. */
export const siteFrame = 'mx-auto w-full max-w-[1680px] px-6 md:px-10 xl:px-16';

/**
 * Bystander screens own their chrome (Brand + Call 907). Responder screens
 * use ResponderShell. This wrapper only locks emergency copy against Translate.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const bystander = pathname === routes.home || pathname.startsWith('/emergency');

  if (bystander) {
    return (
      <div className="notranslate min-h-dvh w-full" translate="no">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

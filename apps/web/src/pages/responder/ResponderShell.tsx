import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TranslateSlot } from '@/components/TranslateSlot';
import { LogoMark } from '@/components/ui';
import { routes } from '@/routes/paths';
import { responderSession } from '@/services/auth/responderToken';
import { crewName, useResponderSession } from './format';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'R';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function ResponderShell({ children }: { children: ReactNode }) {
  const session = useResponderSession();
  const name = crewName(session);

  return (
    <main className="d-responder min-h-screen bg-[#eef2f5] text-[#12202d]">
      <header className="border-b border-[#ccd5dc] bg-[#142737] text-white">
        <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-3 px-6 md:px-10 xl:px-16">
          <Link to={routes.responder.list} className="flex min-w-0 items-center gap-3 text-left">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white p-1">
              <LogoMark compact className="h-8 w-8" />
            </span>
            <span className="truncate font-extrabold tracking-[0.04em]">
              DERES <span className="font-semibold text-white/80">907 HANDOFF</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <TranslateSlot />
            {session ? (
              <>
                <span className="hidden max-w-[14rem] truncate text-xs font-bold text-white sm:block">{name}</span>
                <span className="grid size-9 place-items-center rounded-full bg-[#294359] text-xs font-extrabold text-white">
                  {initials(name)}
                </span>
                <button
                  type="button"
                  onClick={() => responderSession.clear()}
                  className="rounded-lg border border-white/45 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white"
                >
                  Sign out
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { LogoMark } from '@/components/ui';
import { authApi, isApiClientError, toUiErrorMessage } from '@/services/api';
import { responderSession } from '@/services/auth/responderToken';
import { ResponderShell } from './ResponderShell';
import { useResponderSession } from './format';

function SignIn() {
  const [email, setEmail] = useState('');
  const [invite, setInvite] = useState('');
  const signIn = useMutation({
    mutationFn: authApi.responderSignIn,
    onSuccess: (session) => responderSession.set(session),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    signIn.mutate({ email, invite });
  };

  return (
    <ResponderShell>
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1680px] items-center px-6 py-12 md:px-10 lg:grid-cols-2 lg:gap-20 xl:px-16">
        <section>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#087a65]">Professional access</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-4xl">Live incident handoff.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5c6c78]">
            See what is known, what remains uncertain, and what the bystander has already done.
          </p>
        </section>
        <form
          onSubmit={submit}
          className="mt-10 rounded-2xl border border-[#cbd5dc] bg-white p-6 shadow-[0_16px_45px_rgba(29,54,72,0.08)] sm:p-8 lg:mt-0"
        >
          <LogoMark className="h-16 w-auto" />
          <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.03em]">Join with team invite</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#697985]">Use the invite code shared by your response lead.</p>
          {signIn.isError ? (
            <p className="mt-4 text-sm font-bold text-[#aa281f]" role="alert">
              {isApiClientError(signIn.error) && signIn.error.status === 401
                ? 'That email and invite code did not match.'
                : toUiErrorMessage(signIn.error)}
            </p>
          ) : null}
          <label className="mt-7 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#52636f]" htmlFor="responder-email">
            Email
          </label>
          <input
            id="responder-email"
            className="mt-2 h-14 w-full rounded-xl border border-[#aebdc7] bg-[#f8fafb] px-4 text-lg font-bold outline-none focus:border-[#087a65] focus:ring-4 focus:ring-[#087a65]/10"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="mt-4 block text-xs font-extrabold uppercase tracking-[0.1em] text-[#52636f]" htmlFor="responder-invite">
            Invite code
          </label>
          <input
            id="responder-invite"
            className="mt-2 h-14 w-full rounded-xl border border-[#aebdc7] bg-[#f8fafb] px-4 text-lg font-bold outline-none focus:border-[#087a65] focus:ring-4 focus:ring-[#087a65]/10"
            type="password"
            autoComplete="current-password"
            required
            placeholder="e.g. ADD-2048"
            value={invite}
            onChange={(event) => setInvite(event.target.value)}
          />
          <button
            type="submit"
            disabled={signIn.isPending}
            className="mt-4 min-h-14 w-full rounded-xl bg-[#087a65] px-5 font-extrabold text-white disabled:opacity-70"
          >
            {signIn.isPending ? 'Signing in…' : 'Open live incidents'}
          </button>
          <p className="mt-5 text-xs leading-relaxed text-[#81909a]">
            Restricted to invited emergency response personnel. Activity is logged.
          </p>
        </form>
      </div>
    </ResponderShell>
  );
}

export function ResponderGate({ children }: { children: ReactNode }) {
  const session = useResponderSession();
  return session ? <>{children}</> : <SignIn />;
}

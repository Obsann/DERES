import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Banner, Button } from '@/components/ui';
import { authApi, isApiClientError, toUiErrorMessage } from '@/services/api';
import { responderSession } from '@/services/auth/responderToken';
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

  const field: CSSProperties = {
    font: 'inherit',
    padding: 'var(--d-space-3)',
    border: '1px solid var(--d-border)',
    borderRadius: 'var(--d-radius-sm)',
    background: 'var(--d-surface)',
  };

  return (
    <main className="d-emergency-layout">
      <form className="d-stack" onSubmit={submit} style={{ '--d-stack-gap': 'var(--d-space-4)' } as CSSProperties}>
        <h1 style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>Responder sign-in</h1>
        <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>
          For emergency responders. People asking for help never need an account.
        </p>
        {signIn.isError ? (
          <Banner
            tone="warning"
            title={
              isApiClientError(signIn.error) && signIn.error.status === 401
                ? 'That email and invite code did not match.'
                : toUiErrorMessage(signIn.error)
            }
          />
        ) : null}
        <label className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-1)' } as CSSProperties}>
          <span>Email</span>
          <input style={field} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-1)' } as CSSProperties}>
          <span>Team invite code</span>
          <input style={field} type="password" autoComplete="current-password" required value={invite} onChange={(e) => setInvite(e.target.value)} />
        </label>
        <Button type="submit" size="lg" block disabled={signIn.isPending}>
          {signIn.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}

export function ResponderGate({ children }: { children: ReactNode }) {
  const session = useResponderSession();
  return session ? <>{children}</> : <SignIn />;
}

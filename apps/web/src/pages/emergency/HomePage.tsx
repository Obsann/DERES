import type { CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Banner, Button } from '@/components/ui';
import { emergencyCopy } from '@/i18n/emergencyCopy';
import { toUiErrorMessage } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { rememberedLanguage, useStartEmergency } from './useStartEmergency';

/** E1 · Start. One obvious action; language is remembered after the first choice. */
export function HomePage() {
  const navigate = useNavigate();
  const session = useEmergencySession();
  const remembered = rememberedLanguage();
  const language = remembered ?? session.language;
  const copy = emergencyCopy(language);
  const { start, isPending, error } = useStartEmergency();

  const onStart = () => {
    if (remembered) start(remembered);
    else navigate(`${routes.emergency.language}?start=1`);
  };

  return (
    <main className="d-emergency-layout d-stack" style={{ '--d-stack-gap': 'var(--d-space-6)' } as CSSProperties}>
      <header className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-2)' } as CSSProperties}>
        <p style={{ margin: 0, fontWeight: 700, color: 'var(--d-brand)' }}>
          <span lang="am">ድረስ</span> DERES
        </p>
        <h1 lang={language} style={{ margin: 0, fontSize: 'var(--d-text-display)', lineHeight: 'var(--d-leading-tight)' }}>
          {copy.headline}
        </h1>
        <p lang={language} style={{ margin: 0, color: 'var(--d-ink-muted)', fontSize: 'var(--d-text-lg)' }}>
          {copy.subhead}
        </p>
      </header>

      {error ? <Banner tone="warning" title={toUiErrorMessage(error)} /> : null}

      <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-3)' } as CSSProperties}>
        <Button variant="emergency" size="xl" block icon="alert" onClick={onStart} disabled={isPending}>
          <span lang={language}>{isPending ? copy.starting : copy.startEmergency}</span>
        </Button>
        <Link className="d-button d-button--quiet" to={routes.emergency.language}>
          <span lang={language}>
            {copy.languageName} · {copy.changeLanguage}
          </span>
        </Link>
      </div>

      <footer style={{ marginTop: 'auto' }}>
        <Link className="d-button d-button--quiet" to={routes.responder.list}>
          Responder sign-in
        </Link>
      </footer>
    </main>
  );
}

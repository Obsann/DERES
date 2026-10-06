import type { CSSProperties } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Language } from '@voicesos/shared';
import { Banner, Button } from '@/components/ui';
import { useProtocolsQuery } from '@/hooks';
import { emergencyCopy } from '@/i18n/emergencyCopy';
import { toUiErrorMessage } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { rememberLanguage, useStartEmergency } from './useStartEmergency';

const ALL_LANGUAGES = [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO];

/** E2 · Language. Each option is written in its own script. */
export function LanguagePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const startAfter = params.get('start') === '1';
  const session = useEmergencySession();
  const protocols = useProtocolsQuery();
  const { start, isPending, error } = useStartEmergency();

  // Offer what the protocol supports; fall back to all three if the catalog is unreachable.
  const supported = protocols.data?.flatMap((protocol) => protocol.languages) ?? ALL_LANGUAGES;
  const languages = ALL_LANGUAGES.filter((language) => supported.includes(language));

  const choose = (language: Language) => {
    rememberLanguage(language);
    session.setLanguage(language);
    if (startAfter) start(language);
    else navigate(routes.home);
  };

  return (
    <main className="d-emergency-layout d-stack" style={{ '--d-stack-gap': 'var(--d-space-5)' } as CSSProperties}>
      <h1 style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>
        {languages.map((language) => (
          <span key={language} lang={language} style={{ display: 'block' }}>
            {emergencyCopy(language).chooseLanguage}
          </span>
        ))}
      </h1>

      {error ? <Banner tone="warning" title={toUiErrorMessage(error)} /> : null}

      <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-3)' } as CSSProperties}>
        {languages.map((language) => (
          <Button
            key={language}
            variant={language === session.language ? 'primary' : 'secondary'}
            size="lg"
            block
            disabled={isPending}
            onClick={() => choose(language)}
          >
            <span lang={language}>{emergencyCopy(language).languageName}</span>
          </Button>
        ))}
      </div>
    </main>
  );
}

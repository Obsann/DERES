import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Language } from '@voicesos/shared';
import { siteFrame } from '@/components/AppShell';
import { Brand, Icon } from '@/components/ui';
import { useProtocolsQuery } from '@/hooks';
import { emergencyCopy } from '@/i18n/emergencyCopy';
import { toUiErrorMessage } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { rememberedLanguage, rememberLanguage, useStartEmergency } from './useStartEmergency';

const ALL_LANGUAGES = [Language.ENGLISH, Language.AMHARIC, Language.AFAAN_OROMO];

/** E2 · Language. Each option is written in its own script. */
export function LanguagePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const startAfter = params.get('start') === '1';
  const session = useEmergencySession();
  const protocols = useProtocolsQuery();
  const { start, isPending, error } = useStartEmergency();
  const current = rememberedLanguage() ?? session.language;
  const chrome = emergencyCopy(current);

  const supported = protocols.data?.flatMap((protocol) => protocol.languages) ?? ALL_LANGUAGES;
  const languages = ALL_LANGUAGES.filter((language) => supported.includes(language));

  const choose = (language: Language) => {
    rememberLanguage(language);
    session.setLanguage(language);
    if (startAfter) start(language);
    else navigate(routes.home);
  };

  return (
    <main className="min-h-dvh w-full bg-[#f4f1e9] text-[#122d25]">
      <div className={`${siteFrame} flex min-h-dvh flex-col py-6 md:py-8`}>
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            to={routes.home}
            className="grid size-11 place-items-center rounded-full border border-[#c6cbc6]"
            aria-label={chrome.returnStart}
          >
            <Icon name="x" />
          </Link>
        </div>
        <section className="flex flex-1 flex-col justify-center py-10 md:py-16">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">{chrome.beforeBegin}</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2rem,3vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em]">
            {chrome.chooseLanguage}
          </h1>
          <p className="mt-3 max-w-xl text-base font-medium text-[#60706a]">{chrome.languageLocked}</p>
          {error ? (
            <p className="mt-4 text-sm font-bold text-[#ba3b2a]" role="alert">
              {toUiErrorMessage(error)}
            </p>
          ) : null}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {languages.map((language) => {
              const copy = emergencyCopy(language);
              const selected = language === current;
              return (
                <button
                  key={language}
                  type="button"
                  lang={language}
                  disabled={isPending}
                  aria-pressed={selected}
                  onClick={() => choose(language)}
                  className="group flex min-h-20 items-center justify-between rounded-2xl border-2 border-[#bcc5bf] bg-white px-5 text-left transition hover:border-[#1e5e4b] disabled:opacity-70 md:min-h-32 md:flex-col md:items-start md:justify-between md:p-6 aria-pressed:border-[#1e5e4b]"
                >
                  <span>
                    <span className="block text-xl font-extrabold md:text-2xl">{copy.languageName}</span>
                    <span className="mt-1 block text-sm font-medium text-[#73807b]">{copy.continueInLanguage}</span>
                  </span>
                  <span className="grid size-10 place-items-center rounded-full bg-[#e9eee9] text-[#1c5b48] transition group-hover:bg-[#1c5b48] group-hover:text-white md:mt-8">
                    <Icon name="arrow" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

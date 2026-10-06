import { Link, useNavigate } from 'react-router-dom';
import { Brand, Icon } from '@/components/ui';
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
    <main className="min-h-screen bg-[#f4f1e9] text-[#122d25]" lang={language}>
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(22px,env(safe-area-inset-top))] sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Brand />
          <Link
            to={routes.emergency.language}
            className="flex min-h-12 items-center gap-2 rounded-full border border-[#b9c2bc] bg-white/60 px-4 text-sm font-bold"
            lang={language}
          >
            {copy.languageName}
            <Icon name="chevron" className="size-4" />
          </Link>
        </header>

        <div className="grid flex-1 items-center py-12 lg:grid-cols-[1fr_0.72fr] lg:gap-20">
          <section className="max-w-[760px]">
            <p className="mb-6 text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">{copy.eyebrow}</p>
            <h1 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-extrabold leading-[0.95] tracking-[-0.05em]">
              {copy.stayWithThem}
              <br />
              <span className="text-[#407a68]">{copy.wellGuideYou}</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-[#52645e] sm:text-xl">{copy.subhead}</p>
          </section>

          <section className="mt-12 lg:mt-0">
            {error ? (
              <p className="mb-4 text-sm font-bold text-[#ba3b2a]" role="alert">
                {toUiErrorMessage(error)}
              </p>
            ) : null}
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="group flex min-h-32 w-full items-center justify-between rounded-[1.75rem] bg-[#e84e36] p-6 text-left text-white shadow-[0_24px_60px_rgba(175,47,32,0.24)] transition hover:bg-[#d9432e] disabled:opacity-70 sm:min-h-36 sm:p-8"
            >
              <span>
                <span className="block text-sm font-bold uppercase tracking-[0.15em] text-white/70">{copy.noAccountNeeded}</span>
                <span className="mt-3 block text-[clamp(1.5rem,2.4vw,2.15rem)] font-extrabold leading-none tracking-[-0.04em]">
                  {isPending ? copy.starting : copy.startEmergency}
                </span>
              </span>
              <span className="grid size-16 shrink-0 place-items-center rounded-full bg-white text-[#c63b28] transition group-hover:translate-x-1 sm:size-20">
                <Icon name="arrow" className="size-8 sm:size-10" />
              </span>
            </button>
            <p className="mt-5 text-center text-sm font-semibold text-[#6c7974]">{copy.startCaption}</p>
          </section>
        </div>

        <footer className="flex items-end justify-between gap-4 border-t border-[#d5d5cb] pt-5">
          <p className="max-w-xs text-xs leading-relaxed text-[#78837e]">{copy.protocolNote}</p>
          <Link to={routes.responder.list} className="text-xs font-bold text-[#52645e] underline decoration-[#aab3ae] underline-offset-4" lang="en">
            {copy.responderAccess}
          </Link>
        </footer>
      </div>
    </main>
  );
}

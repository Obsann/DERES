import { Link, useNavigate } from 'react-router-dom';
import { siteFrame } from '@/components/AppShell';
import { Brand, Icon, type IconName } from '@/components/ui';
import { EMERGENCY_NUMBERS } from '@/config/emergency';
import { emergencyCopy } from '@/i18n/emergencyCopy';
import { toUiErrorMessage } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { landing } from './landingCopy';
import { rememberedLanguage, useStartEmergency } from './useStartEmergency';

const ambulance = EMERGENCY_NUMBERS.ambulance;

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
    <main className="min-h-dvh w-full bg-[#f4f1e9] text-[#122d25]" lang={language}>
      <header className="sticky top-0 z-30 border-b border-[#d9ddd4] bg-[#f4f1e9]/90 backdrop-blur-md">
        <div className={`${siteFrame} flex h-20 items-center justify-between gap-6 md:h-24`}>
          <Brand />
          <nav className="flex items-center gap-3 md:gap-5">
            <a href="#platform" className="hidden text-sm font-bold text-[#52645e] hover:text-[#122d25] lg:inline" lang="en">
              {landing.navPlatform}
            </a>
            <a href="#how" className="hidden text-sm font-bold text-[#52645e] hover:text-[#122d25] lg:inline" lang="en">
              {landing.navHow}
            </a>
            <Link to={routes.responder.list} className="hidden text-sm font-bold text-[#52645e] hover:text-[#122d25] md:inline" lang="en">
              {landing.navResponders}
            </Link>
            <Link
              to={routes.emergency.language}
              className="flex min-h-11 items-center gap-2 rounded-full border border-[#b9c2bc] bg-white/70 px-4 text-sm font-bold"
              lang={language}
            >
              {copy.languageName}
              <Icon name="chevron" className="size-4" />
            </Link>
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="hidden min-h-11 rounded-full bg-[#e84e36] px-4 text-sm font-extrabold text-white hover:bg-[#d9432e] disabled:opacity-70 md:inline-flex md:items-center"
            >
              {isPending ? copy.starting : copy.startEmergency}
            </button>
          </nav>
        </div>
      </header>

      <section className={`${siteFrame} grid items-center gap-12 py-12 md:grid-cols-2 md:gap-16 md:py-16 xl:gap-24 xl:py-20`}>
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">{copy.eyebrow}</p>
          <h1 className="text-[clamp(2.4rem,3.4vw,4.25rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
            {copy.stayWithThem}
            <br />
            <span className="text-[#407a68]">{copy.wellGuideYou}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-[#52645e] md:text-lg">{copy.subhead}</p>
          <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-[#6c7974] md:text-base" lang="en">
            {landing.heroLead}
          </p>
          {error ? (
            <p className="mt-4 text-sm font-bold text-[#ba3b2a]" role="alert">
              {toUiErrorMessage(error)}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="group flex min-h-16 flex-1 items-center justify-between rounded-2xl bg-[#e84e36] px-5 text-left text-white shadow-[0_24px_60px_rgba(175,47,32,0.18)] transition hover:bg-[#d9432e] disabled:opacity-70"
            >
              <span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.15em] text-white/70">{copy.noAccountNeeded}</span>
                <span className="mt-1 block text-xl font-extrabold leading-none tracking-[-0.03em]">
                  {isPending ? copy.starting : copy.startEmergency}
                </span>
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[#c63b28] transition group-hover:translate-x-1">
                <Icon name="arrow" className="size-5" />
              </span>
            </button>
            <Link
              to={routes.responder.list}
              lang="en"
              className="flex min-h-16 items-center justify-center rounded-2xl border-2 border-[#bcc5bf] bg-white px-6 text-sm font-extrabold text-[#122d25] hover:border-[#1e5e4b] sm:min-w-[12.5rem]"
            >
              {landing.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#6c7974]">{copy.startCaption}</p>
        </div>
        <HeroPreview />
      </section>

      <section className="border-y border-[#d9ddd4] bg-white" lang="en">
        <div className={`${siteFrame} py-8 md:py-10`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7a8882]">{landing.trustLabel}</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {landing.trust.map((item) => (
              <div key={item.label} className="border-l-2 border-[#c5d4ce] pl-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#7a8882]">{item.label}</p>
                <p className="mt-1 text-sm font-bold leading-snug text-[#122d25]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${siteFrame} py-12 md:py-16`} lang="en">
        <div className="overflow-hidden rounded-3xl border border-[#d5d5cb]">
          <div className="grid md:grid-cols-2">
            <div className="bg-[#f3e6df] p-8 md:p-12 lg:p-14">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ba3b2a]">{landing.problemEyebrow}</p>
              <h2 className="mt-3 text-[clamp(1.6rem,2.2vw,2.35rem)] font-extrabold leading-tight tracking-[-0.03em]">
                {landing.problemTitle}
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#5c4a43] md:text-base">{landing.problemBody}</p>
              <ul className="mt-6 space-y-3">
                {landing.problemPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-bold text-[#3d2e29]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e8cfc6] text-[#ba3b2a]">
                      <Icon name="alert" className="size-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#14362d] p-8 text-[#e7f0eb] md:p-12 lg:p-14">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#86c9b4]">{landing.solutionEyebrow}</p>
              <h2 className="mt-3 text-[clamp(1.6rem,2.2vw,2.35rem)] font-extrabold leading-tight tracking-[-0.03em] text-white">
                {landing.solutionTitle}
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-[#c5d9d0] md:text-base">{landing.solutionBody}</p>
              <ul className="mt-6 space-y-3">
                {landing.solutionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-bold text-white">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#1e5e4b]">
                      <Icon name="check" className="size-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className={`${siteFrame} scroll-mt-24 pb-6 md:pb-10`} lang="en">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ba3b2a]">{landing.solutionsEyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-[clamp(1.7rem,2.4vw,2.6rem)] font-extrabold leading-tight tracking-[-0.03em]">
          {landing.solutionsTitle}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {landing.solutions.map((item) => (
            <article key={item.title} className="flex flex-col rounded-2xl border border-[#d5d5cb] bg-white p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-[#e8f1ed] text-[#1c5b48]">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-[#5d6c66]">{item.body}</p>
              <p className="mt-5 border-t border-[#e4e6df] pt-4 text-sm font-bold text-[#1c5b48]">{item.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 bg-[#122d25] text-white" lang="en">
        <div className={`${siteFrame} py-12 md:py-16`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#86c9b4]">{landing.impactEyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.7rem,2.4vw,2.6rem)] font-extrabold leading-tight tracking-[-0.03em]">
            {landing.impactTitle}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {landing.impact.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="grid size-10 place-items-center rounded-lg bg-[#1e5e4b] text-[#9ee0cb]">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.12em] text-[#86c9b4]">{item.impact}</p>
                <h3 className="mt-2 text-lg font-extrabold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#c5d9d0]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${siteFrame} grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20`} lang="en">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ba3b2a]">{landing.storyEyebrow}</p>
          <h2 className="mt-3 text-[clamp(1.7rem,2.4vw,2.6rem)] font-extrabold leading-tight tracking-[-0.03em]">
            {landing.storyTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-[#52645e]">{landing.storyBody}</p>
        </div>
        <div className="rounded-3xl border border-[#d5d5cb] bg-white p-6 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#7a8882]">Usual path</p>
          <ol className="mt-5 space-y-4">
            {['Check response', `Call ambulance ${ambulance}`, 'Open airway', 'Check breathing', 'Chest compressions'].map(
              (step, index) => (
                <li key={step} className="flex items-center gap-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#122d25] text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <span className="text-base font-bold">{step}</span>
                </li>
              ),
            )}
          </ol>
        </div>
      </section>

      <section id="how" className="scroll-mt-24 border-y border-[#d9ddd4] bg-white" lang="en">
        <div className={`${siteFrame} py-14 md:py-20`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#ba3b2a]">{landing.stepsEyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.7rem,2.4vw,2.6rem)] font-extrabold leading-tight tracking-[-0.03em]">
            {landing.stepsTitle}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {landing.steps.map((step) => (
              <article key={step.n} className="rounded-2xl border border-[#d5d5cb] bg-[#f4f1e9] p-6 md:p-8">
                <p className="text-sm font-extrabold tracking-[0.12em] text-[#407a68]">{step.n}</p>
                <h3 className="mt-3 text-xl font-extrabold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#5d6c66]">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0e1f1a] text-white" lang="en">
        <div className={`${siteFrame} py-12 md:py-16`}>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#86c9b4]">{landing.statsEyebrow}</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {landing.stats.map((stat) => (
              <div key={stat.label} className="border-t border-white/15 pt-5">
                <p className="text-[clamp(2.2rem,3vw,3.25rem)] font-extrabold leading-none tracking-[-0.04em]">{stat.value}</p>
                <p className="mt-3 text-sm font-extrabold">{stat.label}</p>
                <p className="mt-1 text-sm font-medium text-[#9bb3ab]">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${siteFrame} py-14 md:py-20`} lang="en">
        <div className="rounded-3xl bg-[#14362d] px-6 py-10 text-white md:px-12 md:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#86c9b4]">{landing.ctaEyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.8rem,2.6vw,2.8rem)] font-extrabold leading-tight tracking-[-0.03em]">
            {landing.ctaTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-base font-medium text-[#c5d9d0]">{landing.ctaBody}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="min-h-14 rounded-2xl bg-[#e84e36] px-6 text-base font-extrabold hover:bg-[#d9432e] disabled:opacity-70"
            >
              {isPending ? copy.starting : copy.startEmergency}
            </button>
            <Link
              to={routes.responder.list}
              className="flex min-h-14 items-center justify-center rounded-2xl border border-white/25 px-6 text-base font-extrabold hover:bg-white/5"
            >
              {landing.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d5d5cb] pb-10 pt-8">
        <div className={`${siteFrame} flex flex-col gap-6 md:flex-row md:items-end md:justify-between`}>
          <p className="max-w-2xl text-xs leading-relaxed text-[#78837e] md:text-sm" lang="en">
            {landing.footerNote} {copy.protocolNote}
          </p>
          <Link
            to={routes.responder.list}
            className="text-xs font-bold text-[#52645e] underline decoration-[#aab3ae] underline-offset-4 md:hidden"
            lang="en"
          >
            {copy.responderAccess}
          </Link>
        </div>
      </footer>
    </main>
  );
}

function HeroPreview() {
  const rows: { icon: IconName; label: string; value: string; tone?: 'warn' | 'ok' | 'muted' }[] = [
    { icon: 'location', label: 'Location', value: 'Shared with responders', tone: 'ok' },
    { icon: 'pulse', label: 'Breathing', value: 'Unknown', tone: 'warn' },
    { icon: 'phone', label: 'Ambulance', value: `${ambulance} — call from the screen`, tone: 'ok' },
    { icon: 'mic', label: 'Guidance', value: 'Open the airway', tone: 'muted' },
  ];

  return (
    <aside className="w-full md:justify-self-end" lang="en" aria-hidden="true">
      <div className="overflow-hidden rounded-3xl border border-[#1a3d34] bg-[#122d25] text-white shadow-[0_28px_70px_rgba(18,45,37,0.28)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#86c9b4]">Live incident intelligence</p>
            <p className="mt-1 text-lg font-extrabold">Unresponsive adult</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#1e5e4b] px-3 py-1 text-[11px] font-extrabold text-[#9ee0cb]">
            <span className="size-1.5 rounded-full bg-[#6ee7b7]" />
            Live
          </span>
        </div>
        <div className="space-y-3 p-5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
              <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-[#9ee0cb]">
                <Icon name={row.icon} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8aa198]">{row.label}</span>
                <span className="block truncate text-sm font-bold">{row.value}</span>
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                  row.tone === 'ok'
                    ? 'bg-[#1e5e4b] text-[#9ee0cb]'
                    : row.tone === 'warn'
                      ? 'bg-[#5a3a18] text-[#f3d08a]'
                      : 'bg-white/10 text-[#c5d9d0]'
                }`}
              >
                {row.tone === 'ok' ? 'Known' : row.tone === 'warn' ? 'Unknown' : 'Now'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

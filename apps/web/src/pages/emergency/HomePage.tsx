import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language } from '@voicesos/shared';
import { siteFrame } from '@/components/AppShell';
import { MoleculeField } from '@/components/marketing/MoleculeField';
import { Brand, Icon, type IconName } from '@/components/ui';
import { EMERGENCY_NUMBERS, emergencyCallHref } from '@/config/emergency';
import { emergencyCopy, type EmergencyCopy } from '@/i18n/emergencyCopy';
import { toUiErrorMessage } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { landingCopy, type LandingCopy } from './landingCopy';
import { rememberedLanguage, useStartEmergency } from './useStartEmergency';

/** E1 · Start. One obvious action; language is remembered after the first choice. */
export function HomePage() {
  const navigate = useNavigate();
  const session = useEmergencySession();
  const remembered = rememberedLanguage();
  const language = remembered ?? session.language;
  const copy = emergencyCopy(language);
  const landing = landingCopy(language);
  const { start, isPending, error } = useStartEmergency();

  const onStart = () => {
    if (remembered) start(remembered);
    else navigate(`${routes.emergency.language}?start=1`);
  };

  return (
    <main className="relative min-h-dvh w-full overflow-x-hidden bg-[#f4f1e9] text-[#122d25]" lang={language}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(92vh,54rem)]">
        <MoleculeField />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f4f1e9]/20 via-transparent to-[#f4f1e9]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-[#d9ddd4]/70 bg-[#f4f1e9]/75 backdrop-blur-md">
        <div className={`${siteFrame} flex h-20 items-center justify-between gap-6 md:h-24`}>
          <Brand />
          <nav className="flex items-center gap-3 md:gap-6">
            <a
              href="#platform"
              className="hidden text-sm font-semibold text-[#6c7974] transition hover:text-[#122d25] lg:inline"
            >
              {landing.navPlatform}
            </a>
            <a href="#how" className="hidden text-sm font-semibold text-[#6c7974] transition hover:text-[#122d25] lg:inline">
              {landing.navHow}
            </a>
            <Link
              to={routes.responder.list}
              className="hidden text-sm font-semibold text-[#6c7974] transition hover:text-[#122d25] md:inline"
            >
              {landing.navResponders}
            </Link>
            <Link
              to={routes.emergency.language}
              className="flex min-h-11 items-center gap-2 rounded-full border border-[#d0d5cf] bg-white/80 px-4 text-sm font-semibold transition hover:border-[#9bb0a7]"
              lang={language}
            >
              {copy.languageName}
              <Icon name="chevron" className="size-4" />
            </Link>
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="hidden min-h-11 rounded-full bg-[#e84e36] px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(175,47,32,0.18)] transition hover:bg-[#d9432e] hover:shadow-[0_10px_28px_rgba(175,47,32,0.24)] disabled:opacity-70 md:inline-flex md:items-center"
            >
              {isPending ? copy.starting : copy.startEmergency}
            </button>
          </nav>
        </div>
      </header>

      <section className={`relative z-10 ${siteFrame} grid items-center gap-14 py-16 md:grid-cols-2 md:gap-16 md:py-24 xl:gap-24`}>
        <div className="reveal max-w-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#ba3b2a]">{copy.eyebrow}</p>
          <h1 className="text-[clamp(2.6rem,4vw,4.6rem)] font-extrabold leading-[1.02] tracking-[-0.05em]">
            {copy.stayWithThem}
            <br />
            <span className="text-[#407a68]">{copy.wellGuideYou}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-normal leading-relaxed text-[#52645e]">{copy.subhead}</p>
          <p className="mt-4 max-w-xl text-base font-normal leading-relaxed text-[#6c7974]">
            {landing.heroLead}
          </p>
          {error ? (
            <p className="mt-4 text-sm font-semibold text-[#ba3b2a]" role="alert">
              {toUiErrorMessage(error)}
            </p>
          ) : null}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="group flex min-h-16 flex-1 items-center justify-between rounded-2xl bg-[#e84e36] px-5 text-left text-white shadow-[0_24px_60px_rgba(175,47,32,0.18)] transition hover:bg-[#d9432e] hover:shadow-[0_28px_64px_rgba(175,47,32,0.22)] disabled:opacity-70"
            >
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70">{copy.noAccountNeeded}</span>
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
              className="flex min-h-16 items-center justify-center rounded-2xl border border-[#d0d5cf] bg-white/80 px-6 text-sm font-semibold text-[#122d25] backdrop-blur-sm transition hover:border-[#1e5e4b] hover:bg-white sm:min-w-[12.5rem]"
            >
              {landing.secondaryCta}
            </Link>
          </div>
          <p className="mt-4 text-sm font-normal text-[#6c7974]">{copy.startCaption}</p>
        </div>
        <div className="reveal reveal-delay-2">
          <ProductFrame landing={landing} liveLabel={copy.live} guidanceValue={copy.stepNames['step-open-airway'] ?? landing.previewGuidance} />
        </div>
      </section>

      <section className="relative z-10 border-y border-[#e4e6df] bg-white/80 backdrop-blur-sm">
        <div className={`${siteFrame} py-12 md:py-14`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7a8882]">{landing.trustLabel}</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {landing.trust.map((item) => (
              <div key={item.label} className="border-l border-[#d5ddd8] pl-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7a8882]">{item.label}</p>
                <p className="mt-2 text-[15px] font-semibold leading-snug text-[#122d25]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reveal className={`${siteFrame} py-20 md:py-24`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba3b2a]">{landing.evidenceEyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-[clamp(1.85rem,2.6vw,2.85rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
          {landing.evidenceTitle}
        </h2>
        <p className="mt-5 max-w-3xl text-base font-normal leading-relaxed text-[#5d6c66]">{landing.evidenceBody}</p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {landing.evidence.map((item) => (
            <div key={item.label} className="border-t border-[#d5ddd8] pt-6">
              <p className="text-[clamp(2.1rem,2.8vw,2.85rem)] font-extrabold leading-none tracking-[-0.05em] text-[#122d25]">
                {item.value}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#122d25]">{item.label}</p>
              <p className="mt-1 text-sm font-normal text-[#5d6c66]">{item.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-xs font-medium leading-relaxed text-[#7a8882]">{landing.evidenceSource}</p>
      </Reveal>

      <Reveal className={`${siteFrame} py-20 md:py-28`}>
        <div className="overflow-hidden rounded-[1.5rem] border border-[#e2e4dc] shadow-[0_24px_60px_rgba(18,45,37,0.06)]">
          <div className="grid md:grid-cols-2">
            <div className="bg-[#f7eee9] p-10 md:p-14 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba3b2a]">{landing.problemEyebrow}</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.4vw,2.55rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
                {landing.problemTitle}
              </h2>
              <p className="mt-5 text-base font-normal leading-relaxed text-[#5c4a43]">{landing.problemBody}</p>
              <ul className="mt-8 space-y-3">
                {landing.problemPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-medium text-[#3d2e29]">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e8cfc6] text-[#ba3b2a]">
                      <Icon name="alert" className="size-3.5" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#14362d] p-10 text-[#e7f0eb] md:p-14 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86c9b4]">{landing.solutionEyebrow}</p>
              <h2 className="mt-4 text-[clamp(1.75rem,2.4vw,2.55rem)] font-extrabold leading-[1.12] tracking-[-0.035em] text-white">
                {landing.solutionTitle}
              </h2>
              <p className="mt-5 text-base font-normal leading-relaxed text-[#c5d9d0]">{landing.solutionBody}</p>
              <ul className="mt-8 space-y-3">
                {landing.solutionPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm font-medium text-white">
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
      </Reveal>

      <Reveal id="platform" className={`${siteFrame} scroll-mt-28 pb-8 md:pb-12`}>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba3b2a]">{landing.solutionsEyebrow}</p>
        <h2 className="mt-4 max-w-3xl text-[clamp(1.85rem,2.6vw,2.85rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
          {landing.solutionsTitle}
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {landing.solutions.map((item) => (
            <article key={item.title} className="landing-card flex flex-col p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#e8f1ed] text-[#1c5b48]">
                <Icon name={item.icon} className="size-5" />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm font-normal leading-relaxed text-[#5d6c66]">{item.body}</p>
              <p className="mt-6 border-t border-[#eceee8] pt-4 text-sm font-semibold text-[#1c5b48]">{item.outcome}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <section className="mt-8 bg-[#122d25] text-white">
        <Reveal className={`${siteFrame} py-20 md:py-24`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86c9b4]">{landing.impactEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.85rem,2.6vw,2.85rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
            {landing.impactTitle}
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {landing.impact.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#1e5e4b] text-[#9ee0cb]">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86c9b4]">{item.impact}</p>
                <h3 className="mt-2 text-lg font-bold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-[#c5d9d0]">{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal className={`${siteFrame} grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba3b2a]">{landing.storyEyebrow}</p>
          <h2 className="mt-4 text-[clamp(1.85rem,2.6vw,2.85rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
            {landing.storyTitle}
          </h2>
          <p className="mt-5 max-w-xl text-lg font-normal leading-relaxed text-[#52645e]">{landing.storyBody}</p>
        </div>
        <div className="landing-card p-8 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a8882]">{landing.usualPath}</p>
          <ol className="mt-6 space-y-5">
            {[
              copy.stepNames['step-check-response'],
              copy.stepNames['step-call-ems'],
              copy.stepNames['step-open-airway'],
              copy.stepNames['step-check-breathing'],
              copy.stepNames['step-cpr'],
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#122d25] text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="text-base font-semibold">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      <section id="how" className="scroll-mt-28 border-y border-[#e4e6df] bg-white">
        <Reveal className={`${siteFrame} py-20 md:py-28`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba3b2a]">{landing.stepsEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.85rem,2.6vw,2.85rem)] font-extrabold leading-[1.12] tracking-[-0.035em]">
            {landing.stepsTitle}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {landing.steps.map((step) => (
              <article key={step.n} className="landing-card bg-[#f7f5ee] p-8">
                <p className="text-sm font-semibold tracking-[0.14em] text-[#407a68]">{step.n}</p>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-3 text-sm font-normal leading-relaxed text-[#5d6c66]">{step.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-[#0e1f1a] text-white">
        <Reveal className={`${siteFrame} py-20 md:py-24`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86c9b4]">{landing.statsEyebrow}</p>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {landing.stats.map((stat) => (
              <div key={stat.label} className="border-t border-white/12 pt-6">
                <p className="text-[clamp(2.4rem,3.2vw,3.5rem)] font-extrabold leading-none tracking-[-0.05em]">{stat.value}</p>
                <p className="mt-4 text-sm font-semibold">{stat.label}</p>
                <p className="mt-1 text-sm font-normal text-[#9bb3ab]">{stat.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Reveal className={`${siteFrame} py-20 md:py-28`}>
        <div className="rounded-[1.5rem] bg-[#14362d] px-8 py-12 text-white shadow-[0_30px_80px_rgba(18,45,37,0.18)] md:px-14 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#86c9b4]">{landing.ctaEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.95rem,2.8vw,3.1rem)] font-extrabold leading-[1.1] tracking-[-0.04em]">
            {landing.ctaTitle}
          </h2>
          <p className="mt-5 max-w-2xl text-lg font-normal text-[#c5d9d0]">{landing.ctaBody}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              disabled={isPending}
              className="min-h-14 rounded-2xl bg-[#e84e36] px-7 text-base font-bold transition hover:bg-[#d9432e] disabled:opacity-70"
            >
              {isPending ? copy.starting : copy.startEmergency}
            </button>
            <Link
              to={routes.responder.list}
              className="flex min-h-14 items-center justify-center rounded-2xl border border-white/20 px-7 text-base font-semibold transition hover:bg-white/5"
            >
              {landing.secondaryCta}
            </Link>
          </div>
        </div>
      </Reveal>

      <SiteFooter copy={copy} landing={landing} language={language} />
    </main>
  );
}

function SiteFooter({
  copy,
  landing,
  language,
}: {
  copy: EmergencyCopy;
  landing: LandingCopy;
  language: Language;
}) {
  return (
    <footer className="relative overflow-hidden bg-[#07130f] text-[#d7e4de]">
      <div className="absolute inset-0 opacity-80">
        <MoleculeField tone="dark" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-[#07130f] via-[#07130f]/80 to-[#07130f]/35" />
      <div className={`${siteFrame} relative py-10 md:py-12`}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <Brand dark />
            <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-white">{landing.footerTagline}</p>
            <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[#b7c9c2]">
              <a href="#platform" className="transition hover:text-white">
                {landing.navPlatform}
              </a>
              <a href="#how" className="transition hover:text-white">
                {landing.navHow}
              </a>
              <Link to={routes.responder.list} className="transition hover:text-white">
                {landing.navResponders}
              </Link>
              <Link to={routes.emergency.language} className="transition hover:text-white" lang={language}>
                {copy.languageName}
              </Link>
            </nav>
          </div>

          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e88b80]">{landing.footerAmbulance}</p>
            <a
              href={emergencyCallHref}
              className="mt-1 block text-[clamp(4.5rem,8vw,6.5rem)] font-extrabold leading-none tracking-[-0.07em] text-white transition hover:text-[#ffb3a6]"
            >
              {EMERGENCY_NUMBERS.ambulance}
            </a>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[#c5d9d0]">
              <a href={emergencyCallHref} className="inline-flex items-center gap-2 hover:text-white">
                {landing.footerCall}
                <Icon name="phone" className="size-4" />
              </a>
              <span className="text-white/20">·</span>
              <a href={`tel:${EMERGENCY_NUMBERS.fire}`} className="font-medium text-[#9bb3ab] hover:text-white">
                {EMERGENCY_NUMBERS.fire} {landing.footerFire}
              </a>
              <span className="text-white/20">·</span>
              <a href={`tel:${EMERGENCY_NUMBERS.police}`} className="font-medium text-[#9bb3ab] hover:text-white">
                {EMERGENCY_NUMBERS.police} {landing.footerPolice}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl text-[11px] leading-relaxed text-[#7f968e] md:text-xs">{landing.footerNote}</p>
          <p className="shrink-0 text-[11px] font-medium text-[#9bb3ab]">{landing.footerRights}</p>
        </div>
      </div>
    </footer>
  );
}

function Reveal({
  children,
  className = '',
  id,
  lang,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  lang?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true);
      return;
    }
    const showIfVisible = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94) setOn(true);
    };
    showIfVisible();
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      lang={lang}
      className={`${className} transition-[opacity,transform] duration-700 ease-out ${
        on ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      {children}
    </section>
  );
}

function ProductFrame({
  landing,
  liveLabel,
  guidanceValue,
}: {
  landing: LandingCopy;
  liveLabel: string;
  guidanceValue: string;
}) {
  const rows: { icon: IconName; label: string; value: string; tone?: 'warn' | 'ok' | 'muted' }[] = [
    { icon: 'location', label: landing.previewLocation, value: landing.previewLocationValue, tone: 'ok' },
    { icon: 'pulse', label: landing.previewBreathing, value: landing.previewBreathingValue, tone: 'warn' },
    { icon: 'phone', label: landing.previewAmbulance, value: landing.previewAmbulanceValue, tone: 'ok' },
    { icon: 'mic', label: landing.previewGuidance, value: guidanceValue, tone: 'muted' },
  ];

  return (
    <aside className="relative w-full md:justify-self-end" aria-hidden="true">
      <div className="absolute -inset-10 rounded-full bg-[#86c9b4]/18 blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-[#d7ddd6] bg-white shadow-[0_32px_80px_rgba(18,45,37,0.16)]">
        <div className="flex items-center gap-2 border-b border-[#eceee8] bg-[#f7f6f1] px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#e88b80]" />
          <span className="size-2.5 rounded-full bg-[#e4c36a]" />
          <span className="size-2.5 rounded-full bg-[#7dcf9a]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#7a8882]">
            {landing.previewUrl}
          </span>
        </div>
        <div className="bg-[#122d25] text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86c9b4]">{landing.previewEyebrow}</p>
              <p className="mt-1 text-lg font-bold">{landing.previewTitle}</p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-[#1e5e4b] px-3 py-1 text-[11px] font-semibold text-[#9ee0cb]">
              <span className="size-1.5 rounded-full bg-[#6ee7b7]" />
              {liveLabel}
            </span>
          </div>
          <div className="space-y-3 p-5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
                <span className="grid size-9 place-items-center rounded-lg bg-white/10 text-[#9ee0cb]">
                  <Icon name={row.icon} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8aa198]">{row.label}</span>
                  <span className="block truncate text-sm font-semibold">{row.value}</span>
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    row.tone === 'ok'
                      ? 'bg-[#1e5e4b] text-[#9ee0cb]'
                      : row.tone === 'warn'
                        ? 'bg-[#5a3a18] text-[#f3d08a]'
                        : 'bg-white/10 text-[#c5d9d0]'
                  }`}
                >
                  {row.tone === 'ok' ? landing.previewKnown : row.tone === 'warn' ? landing.previewUnknown : landing.previewNow}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

import { Link } from 'react-router-dom';
import { siteFrame } from '@/components/AppShell';
import { Brand } from '@/components/ui';
import { emergencyCopy } from '@/i18n/emergencyCopy';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';
import { rememberedLanguage } from '@/pages/emergency/useStartEmergency';

/** Catch-all for unknown paths. */
export function NotFoundPage() {
  const session = useEmergencySession();
  const language = rememberedLanguage() ?? session.language;
  const copy = emergencyCopy(language);

  return (
    <main className="min-h-dvh w-full bg-[#f4f1e9] text-[#122d25]" lang={language}>
      <div className={`${siteFrame} flex min-h-dvh flex-col py-6 md:py-8`}>
        <Brand />
        <section className="flex flex-1 flex-col justify-center py-12 md:max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">{copy.notFoundEyebrow}</p>
          <h1 className="mt-3 text-[clamp(2rem,3vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.04em]">{copy.notFoundTitle}</h1>
          <Link
            to={routes.home}
            className="mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-[#e84e36] px-6 text-sm font-extrabold text-white md:min-h-14"
          >
            {copy.returnStart}
          </Link>
        </section>
      </div>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { siteFrame } from '@/components/AppShell';
import { Brand } from '@/components/ui';
import { routes } from '@/routes/paths';

/** Catch-all for unknown paths. */
export function NotFoundPage() {
  return (
    <main className="min-h-dvh w-full bg-[#f4f1e9] text-[#122d25]">
      <div className={`${siteFrame} flex min-h-dvh flex-col py-6 md:py-8`}>
        <Brand />
        <section className="flex flex-1 flex-col justify-center py-12 md:max-w-2xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">Page not found</p>
          <h1 className="mt-3 text-[clamp(2rem,3vw,3rem)] font-extrabold leading-[1.08] tracking-[-0.04em]">
            This screen is not part of DERES.
          </h1>
          <Link
            to={routes.home}
            className="mt-8 inline-flex min-h-12 w-fit items-center justify-center rounded-xl bg-[#e84e36] px-6 text-sm font-extrabold text-white md:min-h-14"
          >
            Return to start
          </Link>
        </section>
      </div>
    </main>
  );
}

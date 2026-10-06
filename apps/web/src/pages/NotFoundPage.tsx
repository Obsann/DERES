import { Link } from 'react-router-dom';
import { Brand } from '@/components/ui';
import { routes } from '@/routes/paths';

/** Catch-all for unknown paths. */
export function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-[max(24px,env(safe-area-inset-top))] text-[#122d25]">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-3xl flex-col">
        <Brand />
        <section className="flex flex-1 flex-col justify-center py-12">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ba3b2a]">Page not found</p>
          <h1 className="mt-4 text-[clamp(1.85rem,4vw,2.75rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
            This screen is not part of DERES.
          </h1>
          <Link
            to={routes.home}
            className="mt-10 flex min-h-16 w-full max-w-sm items-center justify-center rounded-2xl bg-[#e84e36] text-base font-extrabold text-white"
          >
            Return to start
          </Link>
        </section>
      </div>
    </main>
  );
}

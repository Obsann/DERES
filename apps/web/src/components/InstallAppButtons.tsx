import type { LandingCopy } from '@/pages/emergency/landingCopy';
import { useAppInstall } from '@/hooks/useAppInstall';

interface InstallAppButtonsProps {
  copy: LandingCopy;
  /** Dark CTA band uses inverted colors. */
  tone?: 'light' | 'dark';
}

/** Store-style controls to put DERES on an iPhone or Android home screen. */
export function InstallAppButtons({ copy, tone = 'light' }: InstallAppButtonsProps) {
  const install = useAppInstall();
  if (install.installed) {
    return (
      <p className={`text-sm font-semibold ${tone === 'dark' ? 'text-[#86c9b4]' : 'text-[#407a68]'}`}>
        {copy.installReady}
      </p>
    );
  }

  const light = tone === 'light';
  const shell = light
    ? 'border-[#cfd6d0] bg-[#122d25] text-white hover:bg-[#0d241e]'
    : 'border-white/25 bg-white text-[#122d25] hover:bg-[#f4f1e9]';
  const ghost = light
    ? 'border-[#cfd6d0] bg-white text-[#122d25] hover:border-[#1e5e4b]'
    : 'border-white/25 bg-transparent text-white hover:bg-white/10';

  return (
    <div className="w-full">
      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${light ? 'text-[#6c7974]' : 'text-[#9bb3ab]'}`}>
        {copy.installEyebrow}
      </p>
      <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => void install.installAndroid()} className={storeButton(shell)}>
          <AndroidMark />
          <span className="text-left">
            <span className="block text-[10px] font-medium uppercase tracking-[0.08em] opacity-70">{copy.installAndroidLabel}</span>
            <span className="block text-sm font-extrabold leading-tight tracking-[-0.02em]">{copy.installAndroidName}</span>
          </span>
        </button>
        <button type="button" onClick={install.installIos} className={storeButton(ghost)}>
          <AppleMark />
          <span className="text-left">
            <span className="block text-[10px] font-medium uppercase tracking-[0.08em] opacity-70">{copy.installIosLabel}</span>
            <span className="block text-sm font-extrabold leading-tight tracking-[-0.02em]">{copy.installIosName}</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function storeButton(classes: string) {
  return `inline-flex min-h-14 min-w-[11.5rem] flex-1 items-center gap-3 rounded-2xl border px-4 py-2.5 transition sm:flex-none ${classes}`;
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.2 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3.3ZM14.7 6.4c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-1 2.5 1 .1 1.9-.4 2.6-1.1Z" />
    </svg>
  );
}

function AndroidMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0" aria-hidden="true" fill="currentColor">
      <path d="M7.2 9.2 5.9 6.9a.5.5 0 0 1 .2-.7.5.5 0 0 1 .7.2l1.3 2.2a7.2 7.2 0 0 1 7.8 0l1.3-2.2a.5.5 0 0 1 .7-.2.5.5 0 0 1 .2.7l-1.3 2.3A6.5 6.5 0 0 1 18.5 15v4.2a1.3 1.3 0 0 1-1.3 1.3h-.4a1.3 1.3 0 0 1-1.3-1.3V17H8.5v2.2A1.3 1.3 0 0 1 7.2 20.5h-.4A1.3 1.3 0 0 1 5.5 19.2V15a6.5 6.5 0 0 1 1.7-5.8ZM9 12.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Zm6 0a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z" />
    </svg>
  );
}

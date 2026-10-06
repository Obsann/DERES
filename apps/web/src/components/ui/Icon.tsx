import type { ReactNode } from 'react';

const icons = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  location: (
    <>
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  mic: (
    <>
      <rect x="8" y="3" width="8" height="12" rx="4" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3m-3 0h6" />
    </>
  ),
  micOff: <path d="M3 3l18 18M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3M5 12a7 7 0 0 0 11.4 5.4M19 12a7 7 0 0 1-.6 2.8M12 19v3" />,
  speaker: (
    <>
      <path d="M4 14h4l5 4V6L8 10H4v4Z" />
      <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a8 8 0 0 1 0 11" />
    </>
  ),
  volume: (
    <>
      <path d="M4 14h4l5 4V6L8 10H4v4Z" />
      <path d="M16 9a4 4 0 0 1 0 6m2.5-8.5a8 8 0 0 1 0 11" />
    </>
  ),
  phone: (
    <path d="M8.5 3.5 6.7 2.8a2 2 0 0 0-2.3.6l-1 1.2c-.8 1-.8 2.4-.3 3.5 2.5 5.8 7 10.3 12.8 12.8 1.1.5 2.5.5 3.5-.3l1.2-1a2 2 0 0 0 .6-2.3l-.7-1.8a2 2 0 0 0-2.3-1.2l-2.1.5a2 2 0 0 1-1.9-.5l-4.5-4.5a2 2 0 0 1-.5-1.9l.5-2.1a2 2 0 0 0-1.2-2.3Z" />
  ),
  pulse: <path d="M3 12h4l2-5 4 10 2-5h6" />,
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.6 2.9 8.3 7 10 4.1-1.7 7-5.4 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  signal: <path d="M4 17v2m4-6v6m4-10v10m4-14v14m4-8v8" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  dots: <path d="M6 12h.01M12 12h.01M18 12h.01" />,
  question: <path d="M9.2 9a3 3 0 1 1 4.3 2.7c-.9.5-1.5 1.3-1.5 2.3M12 17.5h.01" />,
  alert: <path d="M12 3 2 20h20L12 3Zm0 6v5m0 3h.01" />,
  info: <path d="M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />,
  wifiOff: (
    <path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M19 13a10 10 0 0 0-2.3-1.6M2 9.5a15 15 0 0 1 4.3-2.8M22 9.5A15 15 0 0 0 11 5.3M12 20h.01" />
  ),
  repeat: (
    <path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 1.8" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a3.8 3.8 0 0 0-3-3.7M16.5 3.2a3 3 0 0 1 0 5.6" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V8.5L12 4l8 4.5V21" />
      <path d="M9 21v-5h6v5M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01" />
    </>
  ),
} as const satisfies Record<string, ReactNode>;

export type IconName = keyof typeof icons;

/** Decorative by default; pair it with visible text rather than using `label`. */
export function Icon({
  name,
  label,
  className = 'size-6',
}: {
  name: IconName;
  label?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {icons[name]}
    </svg>
  );
}

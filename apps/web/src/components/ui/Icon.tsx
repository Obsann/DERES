const paths = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3',
  micOff: 'M3 3l18 18M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V6a3 3 0 0 0-5.7-1.3M5 12a7 7 0 0 0 11.4 5.4M19 12a7 7 0 0 1-.6 2.8M12 19v3',
  speaker: 'M4 9v6h4l5 4V5L8 9H4Zm12.5-.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
  check: 'M4 12.5l5 5L20 6.5',
  question: 'M9.2 9a3 3 0 1 1 4.3 2.7c-.9.5-1.5 1.3-1.5 2.3M12 17.5h.01',
  alert: 'M12 3 2 20h20L12 3Zm0 6v5m0 3h.01',
  info: 'M12 8h.01M11 12h1v5h1M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
  phone:
    'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z',
  wifiOff: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M19 13a10 10 0 0 0-2.3-1.6M2 9.5a15 15 0 0 1 4.3-2.8M22 9.5A15 15 0 0 0 11 5.3M12 20h.01',
  repeat: 'M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5',
  x: 'M6 6l12 12M18 6 6 18',
} as const;

export type IconName = keyof typeof paths;

/** Decorative by default; pair it with visible text rather than using `label`. */
export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={paths[name]} />
    </svg>
  );
}

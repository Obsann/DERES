export const LOGO_SRC = '/logo.png';
export const LOGO_MARK_SRC = '/icon.png';

/** Official DERES lockup, or the shield mark when `compact` is set. */
export function LogoMark({
  className = 'h-14 w-auto',
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <img
      src={compact ? LOGO_MARK_SRC : LOGO_SRC}
      alt=""
      className={`object-contain ${className}`}
      aria-hidden="true"
    />
  );
}

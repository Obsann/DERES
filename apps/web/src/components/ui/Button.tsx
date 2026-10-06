import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'emergency' | 'primary' | 'secondary' | 'negative' | 'quiet';
export type ButtonSize = 'md' | 'lg' | 'xl';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  pill?: boolean;
  icon?: IconName;
  children: ReactNode;
}

function classes({ variant = 'primary', size = 'md', block, pill }: CommonProps): string {
  return [
    'd-button',
    `d-button--${variant}`,
    size === 'md' ? '' : `d-button--${size}`,
    block ? 'd-button--block' : '',
    pill ? 'd-button--pill' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * `emergency` is reserved for Start emergency and Call emergency services.
 * Emergency screens use `lg` or `xl`; the dashboard uses `md`.
 */
export function Button({
  variant,
  size,
  block,
  pill,
  icon,
  children,
  type = 'button',
  className,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = classes({ variant, size, block, pill, children });
  return (
    <button type={type} className={className ? `${base} ${className}` : base} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </button>
  );
}

/** Same look as {@link Button} for real links, e.g. a `tel:` call link. */
export function ButtonLink({
  variant,
  size,
  block,
  pill,
  icon,
  children,
  className,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base = classes({ variant, size, block, pill, children });
  return (
    <a className={className ? `${base} ${className}` : base} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </a>
  );
}

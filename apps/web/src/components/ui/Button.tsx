import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'emergency' | 'primary' | 'secondary' | 'quiet';
export type ButtonSize = 'md' | 'lg' | 'xl';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  icon?: IconName;
  children: ReactNode;
}

function classes({ variant = 'primary', size = 'md', block }: CommonProps): string {
  return [
    'd-button',
    `d-button--${variant}`,
    size === 'md' ? '' : `d-button--${size}`,
    block ? 'd-button--block' : '',
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
  icon,
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes({ variant, size, block, children })} {...rest}>
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
  icon,
  children,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={classes({ variant, size, block, children })} {...rest}>
      {icon ? <Icon name={icon} /> : null}
      <span>{children}</span>
    </a>
  );
}

import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export type Tone = 'info' | 'warning' | 'critical' | 'success';

const toneIcon: Record<Tone, IconName> = {
  info: 'info',
  warning: 'alert',
  critical: 'alert',
  success: 'check',
};

interface BannerProps {
  tone: Tone;
  title: string;
  children?: ReactNode;
  icon?: IconName;
  /** Recovery action; every failure banner should have exactly one. */
  action?: ReactNode;
}

/** Escalation, connection and failure messages. Critical banners interrupt screen readers. */
export function Banner({ tone, title, children, icon, action }: BannerProps) {
  return (
    <div className={`d-banner d-banner--${tone}`} role={tone === 'critical' ? 'alert' : 'status'}>
      <Icon name={icon ?? toneIcon[tone]} />
      <div className="d-banner__body">
        <p className="d-banner__title">{title}</p>
        {children ? <div className="d-banner__text">{children}</div> : null}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

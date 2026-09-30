import type { ReactNode } from 'react';
import {
  ActionStatus,
  Certainty,
  ConnectionStatus,
  EscalationState,
  IncidentStatus,
} from '@voicesos/shared';
import { Icon, type IconName } from './Icon';

type BadgeTone = 'success' | 'warning' | 'critical' | 'info' | 'neutral';

interface BadgeProps {
  tone: BadgeTone;
  icon?: IconName;
  dashed?: boolean;
  children: ReactNode;
}

export function Badge({ tone, icon, dashed, children }: BadgeProps) {
  return (
    <span className={`d-badge d-badge--${tone}${dashed ? ' d-badge--dashed' : ''}`}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  );
}

const certaintyMeta: Record<Certainty, { label: string; tone: BadgeTone; icon: IconName }> = {
  [Certainty.KNOWN]: { label: 'Known', tone: 'success', icon: 'check' },
  [Certainty.UNCERTAIN]: { label: 'Uncertain', tone: 'warning', icon: 'question' },
  [Certainty.UNKNOWN]: { label: 'Unknown', tone: 'neutral', icon: 'question' },
};

/** Required next to every handoff fact. */
export function CertaintyBadge({ certainty }: { certainty: Certainty }) {
  const meta = certaintyMeta[certainty];
  return (
    <Badge tone={meta.tone} icon={meta.icon} dashed={certainty !== Certainty.KNOWN}>
      {meta.label}
    </Badge>
  );
}

const escalationMeta: Record<EscalationState, { label: string; tone: BadgeTone }> = {
  [EscalationState.NONE]: { label: 'No escalation', tone: 'neutral' },
  [EscalationState.RECOMMENDED]: { label: 'Help recommended', tone: 'warning' },
  [EscalationState.ESCALATED]: { label: 'Escalated', tone: 'critical' },
};

export function EscalationBadge({ state }: { state: EscalationState }) {
  const meta = escalationMeta[state];
  return (
    <Badge tone={meta.tone} icon={state === EscalationState.NONE ? undefined : 'alert'}>
      {meta.label}
    </Badge>
  );
}

const incidentStatusMeta: Record<IncidentStatus, { label: string; tone: BadgeTone }> = {
  [IncidentStatus.ACTIVE]: { label: 'Active', tone: 'info' },
  [IncidentStatus.ESCALATED]: { label: 'Escalated', tone: 'critical' },
  [IncidentStatus.HANDED_OFF]: { label: 'Handed off', tone: 'success' },
  [IncidentStatus.CLOSED]: { label: 'Closed', tone: 'neutral' },
  [IncidentStatus.ABANDONED]: { label: 'Abandoned', tone: 'neutral' },
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const meta = incidentStatusMeta[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

const actionStatusMeta: Record<ActionStatus, { label: string; tone: BadgeTone; icon?: IconName }> = {
  [ActionStatus.GIVEN]: { label: 'Given', tone: 'info' },
  [ActionStatus.CONFIRMED]: { label: 'Done', tone: 'success', icon: 'check' },
  [ActionStatus.UNABLE]: { label: 'Could not do', tone: 'warning', icon: 'x' },
  [ActionStatus.SKIPPED]: { label: 'Skipped', tone: 'neutral' },
};

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  const meta = actionStatusMeta[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}

const connectionMeta: Record<ConnectionStatus, { label: string; tone: BadgeTone; icon?: IconName }> = {
  [ConnectionStatus.IDLE]: { label: 'Not connected', tone: 'neutral' },
  [ConnectionStatus.CONNECTING]: { label: 'Connecting…', tone: 'info' },
  [ConnectionStatus.CONNECTED]: { label: 'Connected', tone: 'success' },
  [ConnectionStatus.DISCONNECTED]: { label: 'Offline', tone: 'warning', icon: 'wifiOff' },
  [ConnectionStatus.RECONNECTING]: { label: 'Reconnecting…', tone: 'warning', icon: 'wifiOff' },
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const meta = connectionMeta[status];
  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}

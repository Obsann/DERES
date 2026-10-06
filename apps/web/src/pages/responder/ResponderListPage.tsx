import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BreathingState,
  ConnectionStatus,
  EscalationState,
  IncidentStatus,
  type Incident,
} from '@voicesos/shared';
import { Icon } from '@/components/ui';
import { useResponderIncidentsQuery, useResponderRealtime } from '@/hooks';
import { responderIncidentPath } from '@/routes/paths';
import { useResponderUi } from '@/state';
import { EMERGENCY_LABEL, locationText, minutesAgo, signOutIfUnauthorized } from './format';
import { ResponderGate } from './ResponderGate';
import { ResponderShell } from './ResponderShell';

const ESCALATION_RANK: Record<EscalationState, number> = {
  [EscalationState.ESCALATED]: 0,
  [EscalationState.RECOMMENDED]: 1,
  [EscalationState.NONE]: 2,
};

function byPriority(a: Incident, b: Incident): number {
  const rank = ESCALATION_RANK[a.state.escalationStatus] - ESCALATION_RANK[b.state.escalationStatus];
  return rank !== 0 ? rank : b.startedAt.localeCompare(a.startedAt);
}

function breathingLabel(incident: Incident): string {
  switch (incident.state.patient.breathing) {
    case BreathingState.NORMAL:
      return 'Yes';
    case BreathingState.ABSENT:
      return 'No';
    case BreathingState.ABNORMAL:
      return 'Abnormal';
    default:
      return 'Unknown';
  }
}

function toneOf(incident: Incident): 'critical' | 'warning' | 'stable' {
  if (incident.status === IncidentStatus.ESCALATED || incident.state.escalationStatus === EscalationState.ESCALATED) {
    return 'critical';
  }
  if (incident.state.patient.breathing === BreathingState.ABSENT || incident.state.escalationStatus === EscalationState.RECOMMENDED) {
    return 'warning';
  }
  return 'stable';
}

function statusLabel(incident: Incident): string {
  if (incident.status === IncidentStatus.HANDED_OFF) return 'Responder arrived';
  if (incident.status === IncidentStatus.ESCALATED) return 'Escalated';
  return 'Active';
}

const TONE_DOT = {
  critical: 'bg-[#d83e35]',
  warning: 'bg-[#d29319]',
  stable: 'bg-[#15836d]',
} as const;

const TONE_BADGE = {
  critical: 'bg-[#f9dfdc] text-[#aa281f]',
  warning: 'bg-[#fbefce] text-[#8a6413]',
  stable: 'bg-[#dff1eb] text-[#116a58]',
} as const;

function IncidentList() {
  const navigate = useNavigate();
  const { connection } = useResponderUi();
  const query = useResponderIncidentsQuery({ limit: 50 });
  useResponderRealtime();
  const [filter, setFilter] = useState<'active' | 'escalated'>('active');

  useEffect(() => signOutIfUnauthorized(query.error), [query.error]);

  const open = (query.data?.items ?? [])
    .filter((incident) => incident.status === IncidentStatus.ACTIVE || incident.status === IncidentStatus.ESCALATED)
    .sort(byPriority);
  const escalated = open.filter(
    (incident) => incident.status === IncidentStatus.ESCALATED || incident.state.escalationStatus === EscalationState.ESCALATED,
  );
  const shown = filter === 'escalated' ? escalated : open;
  const live = connection === ConnectionStatus.CONNECTED;

  return (
    <ResponderShell>
      <div className="mx-auto w-full max-w-[1680px] px-6 py-8 md:px-10 lg:py-10 xl:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#087a65]">Incident intelligence</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Live incidents</h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-[#60717e]">
              Warnings, facts, and steps already taken — updated as the bystander confirms each instruction.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-extrabold ${
              live ? 'border-[#9dcfbe] bg-[#e3f5ef] text-[#08705e]' : 'border-[#ead39c] bg-[#fff7e2] text-[#835f14]'
            }`}
          >
            <span className={`size-2 rounded-full ${live ? 'bg-[#079679]' : 'bg-[#d29319]'}`} />
            {live ? 'Socket live' : connection === ConnectionStatus.CONNECTING ? 'Connecting…' : 'Socket offline'}
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#cbd5dc] bg-white px-5 py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#71808b]">Active</p>
            <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] tabular-nums">{open.length}</p>
          </div>
          <div className="rounded-xl border border-[#cbd5dc] bg-white px-5 py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#71808b]">Escalated</p>
            <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em] tabular-nums">{escalated.length}</p>
          </div>
          <div className="rounded-xl border border-[#cbd5dc] bg-white px-5 py-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#71808b]">Dispatch link</p>
            <p className="mt-1 text-3xl font-extrabold tracking-[-0.04em]">{live ? 'Live' : 'Offline'}</p>
          </div>
        </div>

        <div className="mt-7 flex gap-2 border-b border-[#ccd5dc] pb-4">
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`rounded-lg px-4 py-2 text-sm font-extrabold ${
              filter === 'active' ? 'bg-[#142737] text-white' : 'text-[#60717e]'
            }`}
          >
            Active · {open.length}
          </button>
          <button
            type="button"
            onClick={() => setFilter('escalated')}
            className={`rounded-lg px-4 py-2 text-sm font-extrabold ${
              filter === 'escalated' ? 'bg-[#142737] text-white' : 'text-[#60717e]'
            }`}
          >
            Escalated · {escalated.length}
          </button>
        </div>

        {query.isPending ? <p className="mt-8 text-sm font-semibold text-[#60717e]">Loading incidents…</p> : null}
        {query.isError ? (
          <div className="mt-8">
            <p className="text-sm font-bold text-[#aa281f]">Could not load incidents.</p>
            <button type="button" onClick={() => void query.refetch()} className="mt-3 text-sm font-extrabold text-[#087a65]">
              Try again
            </button>
          </div>
        ) : null}
        {query.data && shown.length === 0 ? (
          <p className="mt-8 text-sm font-semibold text-[#60717e]">No active incidents. New incidents appear here automatically.</p>
        ) : null}

        {shown.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-xl border border-[#cbd5dc] bg-white">
            <div className="hidden grid-cols-[1.15fr_0.7fr_1.4fr_0.7fr_40px] gap-4 border-b border-[#d7dfe4] bg-[#f7f9fa] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#71808b] md:grid">
              <span>Incident</span>
              <span>Breathing</span>
              <span>Location</span>
              <span>Status</span>
              <span />
            </div>
            {shown.map((incident) => {
              const tone = toneOf(incident);
              return (
                <button
                  key={incident.id}
                  type="button"
                  onClick={() => navigate(responderIncidentPath(incident.id))}
                  className="grid w-full gap-4 border-b border-[#e0e5e9] px-5 py-5 text-left last:border-0 hover:bg-[#f7fafb] md:grid-cols-[1.15fr_0.7fr_1.4fr_0.7fr_40px] md:items-center"
                >
                  <span>
                    <span className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${TONE_DOT[tone]}`} />
                      <span className="font-extrabold">{EMERGENCY_LABEL[incident.state.emergencyType]}</span>
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-[#7a8994]">
                      {incident.id.slice(0, 8).toUpperCase()} · {minutesAgo(incident.startedAt)}
                    </span>
                  </span>
                  <span className="text-sm font-bold">
                    <span className="mr-2 text-xs text-[#85939d] md:hidden">Breathing</span>
                    {breathingLabel(incident)}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#536571]">
                    <Icon name="location" className="size-4 shrink-0" />
                    {locationText(incident)}
                  </span>
                  <span>
                    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-extrabold ${TONE_BADGE[tone]}`}>
                      {statusLabel(incident)}
                    </span>
                  </span>
                  <Icon name="chevron" className="hidden size-5 text-[#7a8994] md:block" />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </ResponderShell>
  );
}

/** R1 · Incident list, live over Socket.IO. */
export function ResponderListPage() {
  return (
    <ResponderGate>
      <IncidentList />
    </ResponderGate>
  );
}

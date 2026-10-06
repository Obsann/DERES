import { useEffect, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BreathingState,
  Certainty,
  ConsciousnessState,
  WarningSeverity,
  type Handoff,
  type HandoffFact,
} from '@voicesos/shared';
import { ApiErrorState, ApiLoadingState } from '@/components/ApiState';
import {
  ActionStatusBadge,
  Banner,
  ConnectionBadge,
  EscalationBadge,
  FactList,
  IncidentStatusBadge,
  Panel,
} from '@/components/ui';
import { useResponderRealtime } from '@/hooks';
import { incidentsApi, queryKeys } from '@/services/api';
import { routes } from '@/routes/paths';
import { useResponderUi } from '@/state';
import { EMERGENCY_LABEL, signOutIfUnauthorized } from './format';
import { ResponderGate } from './ResponderGate';

const CONSCIOUSNESS: Record<ConsciousnessState, string> = {
  [ConsciousnessState.RESPONSIVE]: 'Responsive',
  [ConsciousnessState.UNRESPONSIVE]: 'Unresponsive',
  [ConsciousnessState.UNKNOWN]: 'Not established',
};

const BREATHING: Record<BreathingState, string> = {
  [BreathingState.NORMAL]: 'Breathing normally',
  [BreathingState.ABNORMAL]: 'Not breathing normally',
  [BreathingState.ABSENT]: 'Not breathing',
  [BreathingState.UNKNOWN]: 'Not established',
};

const FIELD_LABEL: Record<string, string> = {
  'patient.consciousness': 'Responsiveness',
  'patient.breathing': 'Breathing',
  'patient.ageGroup': 'Age group',
  location: 'Location',
  peopleAffected: 'People affected',
  emergencyType: 'Emergency type',
};

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function locationLine(handoff: Handoff): string {
  const location = handoff.location;
  if (!location) return 'Location unknown';
  const parts = [location.description];
  if (location.latitude !== null && location.longitude !== null) {
    parts.push(`${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`);
  }
  const text = parts.filter(Boolean).join(' · ');
  return text || 'Location unknown';
}

function stateFacts(handoff: Handoff): HandoffFact[] {
  const certaintyOf = (known: boolean) => (known ? Certainty.KNOWN : Certainty.UNKNOWN);
  return [
    {
      label: 'Responsiveness',
      value: CONSCIOUSNESS[handoff.patient.consciousness],
      certainty: certaintyOf(handoff.patient.consciousness !== ConsciousnessState.UNKNOWN),
      establishedAt: null,
    },
    {
      label: 'Breathing',
      value: BREATHING[handoff.patient.breathing],
      certainty: certaintyOf(handoff.patient.breathing !== BreathingState.UNKNOWN),
      establishedAt: null,
    },
    {
      label: 'Current step',
      value: handoff.currentStepLabel ?? 'Not started',
      certainty: Certainty.KNOWN,
      establishedAt: null,
    },
  ];
}

function IncidentDetail({ incidentId }: { incidentId: string }) {
  const { connection } = useResponderUi();
  useResponderRealtime(incidentId);
  const handoff = useQuery({
    queryKey: queryKeys.incidents.handoff(incidentId),
    queryFn: ({ signal }) => incidentsApi.getHandoff(incidentId, { signal }),
  });

  useEffect(() => signOutIfUnauthorized(handoff.error), [handoff.error]);

  if (handoff.isPending) {
    return (
      <main className="d-dashboard-layout">
        <ApiLoadingState label="Loading handoff…" />
      </main>
    );
  }
  if (handoff.isError) {
    return (
      <main className="d-dashboard-layout">
        <ApiErrorState error={handoff.error} onRetry={() => void handoff.refetch()} />
      </main>
    );
  }

  const data = handoff.data;
  const timeline = [...data.timeline].sort((a, b) => b.sequence - a.sequence);

  return (
    <main className="d-dashboard-layout d-stack" style={{ '--d-stack-gap': 'var(--d-space-5)' } as CSSProperties}>
      <Link to={routes.responder.list} className="d-button d-button--quiet" style={{ alignSelf: 'flex-start' }}>
        ← All incidents
      </Link>
      <header className="d-row" style={{ justifyContent: 'space-between' }}>
        <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-1)' } as CSSProperties}>
          <h1 style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>{EMERGENCY_LABEL[data.emergencyType]}</h1>
          <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>
            Started {time(data.startedAt)} · {locationLine(data)}
          </p>
        </div>
        <div className="d-row">
          <EscalationBadge state={data.escalationStatus} />
          <IncidentStatusBadge status={data.status} />
          <ConnectionBadge status={connection} />
        </div>
      </header>

      <div className="d-incident-grid">
        <div className="d-stack">
          <Panel title="Warnings" emphasis="critical">
            {data.warnings.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>No warnings</p>
            ) : (
              <div className="d-stack" style={{ '--d-stack-gap': 'var(--d-space-2)' } as CSSProperties}>
                {data.warnings.map((warning) => (
                  <Banner
                    key={warning.message}
                    tone={warning.severity === WarningSeverity.CRITICAL ? 'critical' : 'warning'}
                    title={warning.message}
                  />
                ))}
              </div>
            )}
          </Panel>
          <Panel title="Critical facts">
            <FactList facts={data.criticalInformation} />
          </Panel>
          <Panel title="Unknown or uncertain" emphasis="uncertain">
            {data.uncertainty.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>Nothing flagged</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 'var(--d-space-5)' }}>
                {data.uncertainty.map((note) => (
                  <li key={`${note.field}-${note.recordedAt}`}>
                    <strong>{FIELD_LABEL[note.field] ?? note.field}</strong> — {note.reason}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="d-stack">
          <Panel title="Current state">
            <FactList facts={stateFacts(data)} />
          </Panel>
          <Panel title="Actions taken">
            {data.actionsTaken.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>No instructions given yet</p>
            ) : (
              <ul className="d-facts">
                {data.actionsTaken.map((action) => (
                  <li key={action.id} className="d-fact">
                    <span className="d-fact__label">{time(action.givenAt)}</span>
                    <span className="d-fact__value">{action.instruction}</span>
                    <ActionStatusBadge status={action.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Timeline" aside={<span style={{ color: 'var(--d-ink-muted)', fontSize: 'var(--d-text-sm)' }}>Handoff v{data.version} · {time(data.generatedAt)}</span>}>
        <ol className="d-timeline">
          {timeline.map((event) => (
            <li key={event.id}>
              <time dateTime={event.occurredAt}>{time(event.occurredAt)}</time>
              <span>{event.summary}</span>
            </li>
          ))}
        </ol>
      </Panel>
    </main>
  );
}

/** R2 · Active incident: warnings, facts, unknowns, state, actions, timeline — in that order. */
export function ResponderIncidentPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  return (
    <ResponderGate>{incidentId ? <IncidentDetail incidentId={incidentId} /> : null}</ResponderGate>
  );
}

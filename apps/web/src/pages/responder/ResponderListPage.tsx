import { useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { EscalationState, IncidentStatus, type Incident } from '@voicesos/shared';
import { ApiErrorState, ApiLoadingState } from '@/components/ApiState';
import { Button, ConnectionBadge, EscalationBadge, IncidentStatusBadge } from '@/components/ui';
import { useResponderIncidentsQuery, useResponderRealtime } from '@/hooks';
import { responderSession } from '@/services/auth/responderToken';
import { responderIncidentPath } from '@/routes/paths';
import { useResponderUi } from '@/state';
import { EMERGENCY_LABEL, locationText, minutesAgo, signOutIfUnauthorized, useResponderSession } from './format';
import { ResponderGate } from './ResponderGate';

const ESCALATION_RANK: Record<EscalationState, number> = {
  [EscalationState.ESCALATED]: 0,
  [EscalationState.RECOMMENDED]: 1,
  [EscalationState.NONE]: 2,
};

function byPriority(a: Incident, b: Incident): number {
  const rank = ESCALATION_RANK[a.state.escalationStatus] - ESCALATION_RANK[b.state.escalationStatus];
  return rank !== 0 ? rank : b.startedAt.localeCompare(a.startedAt);
}

function IncidentList() {
  const navigate = useNavigate();
  const session = useResponderSession();
  const { connection } = useResponderUi();
  const query = useResponderIncidentsQuery({ limit: 50 });
  useResponderRealtime();

  useEffect(() => signOutIfUnauthorized(query.error), [query.error]);

  const open = (query.data?.items ?? [])
    .filter((incident) => incident.status === IncidentStatus.ACTIVE || incident.status === IncidentStatus.ESCALATED)
    .sort(byPriority);

  return (
    <main className="d-dashboard-layout d-stack" style={{ '--d-stack-gap': 'var(--d-space-5)' } as CSSProperties}>
      <header className="d-row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--d-text-xl)' }}>
          Active incidents{query.data ? ` (${open.length})` : ''}
        </h1>
        <div className="d-row">
          <ConnectionBadge status={connection} />
          <span style={{ color: 'var(--d-ink-muted)', fontSize: 'var(--d-text-sm)' }}>{session?.user.email}</span>
          <Button variant="quiet" onClick={() => responderSession.clear()}>
            Sign out
          </Button>
        </div>
      </header>

      {query.isPending ? <ApiLoadingState label="Loading incidents…" /> : null}
      {query.isError ? <ApiErrorState error={query.error} onRetry={() => void query.refetch()} /> : null}
      {query.data && open.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--d-ink-muted)' }}>
          No active incidents. New incidents appear here automatically.
        </p>
      ) : null}

      {open.length > 0 ? (
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Emergency</th>
                <th scope="col">Escalation</th>
                <th scope="col">Started</th>
                <th scope="col">Location</th>
              </tr>
            </thead>
            <tbody>
              {open.map((incident) => (
                <tr
                  key={incident.id}
                  tabIndex={0}
                  onClick={() => navigate(responderIncidentPath(incident.id))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') navigate(responderIncidentPath(incident.id));
                  }}
                >
                  <td><IncidentStatusBadge status={incident.status} /></td>
                  <td>
                    <strong>{EMERGENCY_LABEL[incident.state.emergencyType]}</strong>
                    <span className="d-table__sub">{incident.language.toUpperCase()}</span>
                  </td>
                  <td><EscalationBadge state={incident.state.escalationStatus} /></td>
                  <td>
                    <time dateTime={incident.startedAt}>{minutesAgo(incident.startedAt)}</time>
                  </td>
                  <td>{locationText(incident)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
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

import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActionStatus,
  BreathingState,
  Certainty,
  ConnectionStatus,
  ConsciousnessState,
  EscalationState,
  IncidentStatus,
  WarningSeverity,
  type Handoff,
  type HandoffFact,
} from '@voicesos/shared';
import { Icon } from '@/components/ui';
import { useResponderRealtime, useUpdateIncidentMutation } from '@/hooks';
import { incidentsApi, queryKeys } from '@/services/api';
import { routes } from '@/routes/paths';
import { useResponderUi } from '@/state';
import { EMERGENCY_LABEL, signOutIfUnauthorized } from './format';
import { ResponderGate } from './ResponderGate';
import { ResponderShell } from './ResponderShell';

const CONSCIOUSNESS: Record<ConsciousnessState, string> = {
  [ConsciousnessState.RESPONSIVE]: 'Yes',
  [ConsciousnessState.UNRESPONSIVE]: 'No',
  [ConsciousnessState.UNKNOWN]: 'Unknown',
};

const BREATHING: Record<BreathingState, string> = {
  [BreathingState.NORMAL]: 'Yes',
  [BreathingState.ABNORMAL]: 'Abnormal',
  [BreathingState.ABSENT]: 'No',
  [BreathingState.UNKNOWN]: 'Unknown',
};

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function elapsed(iso: string): string {
  const total = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes} min ${String(seconds).padStart(2, '0')} sec ago`;
}

function locationLine(handoff: Handoff): { title: string; detail: string; shared: boolean; maps: string | null } {
  const location = handoff.location;
  if (!location) return { title: 'Location unknown', detail: 'Not shared', shared: false, maps: null };
  const title = location.description || 'Coordinates shared';
  const coords =
    location.latitude !== null && location.longitude !== null
      ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
      : null;
  const accuracy = location.accuracyMeters ? `Accuracy ±${Math.round(location.accuracyMeters)} m` : null;
  const maps =
    location.latitude !== null && location.longitude !== null
      ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
      : null;
  return {
    title,
    detail: [coords, accuracy].filter(Boolean).join(' · ') || 'Shared with responders',
    shared: true,
    maps,
  };
}

function Fact({ fact }: { fact: HandoffFact }) {
  const style = {
    [Certainty.KNOWN]: 'border-[#b9d9cf] bg-[#eef8f5] text-[#126c59]',
    [Certainty.UNKNOWN]: 'border-[#d4dae0] bg-[#f5f7f8] text-[#667783]',
    [Certainty.UNCERTAIN]: 'border-[#ead39c] bg-[#fff7e2] text-[#835f14]',
  }[fact.certainty];
  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] opacity-70">{fact.certainty}</p>
      <p className="mt-2 text-xs font-bold opacity-70">{fact.label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#172733] notranslate" translate="no">
        {fact.value}
      </p>
    </div>
  );
}

function actionDetail(status: ActionStatus): string {
  if (status === ActionStatus.CONFIRMED) return 'Bystander confirmed';
  if (status === ActionStatus.UNABLE) return 'Bystander could not do this';
  if (status === ActionStatus.SKIPPED) return 'Skipped';
  return 'Awaiting confirmation';
}

function IncidentDetail({ incidentId }: { incidentId: string }) {
  const queryClient = useQueryClient();
  const { connection } = useResponderUi();
  useResponderRealtime(incidentId);
  const update = useUpdateIncidentMutation(incidentId);
  const handoff = useQuery({
    queryKey: queryKeys.incidents.handoff(incidentId),
    queryFn: ({ signal }) => incidentsApi.getHandoff(incidentId, { signal }),
  });

  useEffect(() => signOutIfUnauthorized(handoff.error), [handoff.error]);

  if (handoff.isPending) {
    return (
      <ResponderShell>
        <p className="px-5 py-10 text-sm font-semibold text-[#60717e]">Loading handoff…</p>
      </ResponderShell>
    );
  }
  if (handoff.isError) {
    return (
      <ResponderShell>
        <div className="px-5 py-10">
          <p className="text-sm font-bold text-[#aa281f]">Could not load this incident.</p>
          <button type="button" onClick={() => void handoff.refetch()} className="mt-3 text-sm font-extrabold text-[#087a65]">
            Try again
          </button>
        </div>
      </ResponderShell>
    );
  }

  const data = handoff.data;
  const timeline = [...data.timeline].sort((a, b) => b.sequence - a.sequence);
  const actions = [...data.actionsTaken].sort((a, b) => b.givenAt.localeCompare(a.givenAt));
  const place = locationLine(data);
  const escalated = data.status === IncidentStatus.ESCALATED || data.escalationStatus === EscalationState.ESCALATED;
  const arrived = data.status === IncidentStatus.HANDED_OFF || data.status === IncidentStatus.CLOSED;
  const live = connection === ConnectionStatus.CONNECTED;

  const stateFacts: HandoffFact[] = [
    {
      label: 'Responding',
      value: CONSCIOUSNESS[data.patient.consciousness],
      certainty: data.patient.consciousness === ConsciousnessState.UNKNOWN ? Certainty.UNKNOWN : Certainty.KNOWN,
      establishedAt: null,
    },
    {
      label: 'Normal breathing',
      value: BREATHING[data.patient.breathing],
      certainty: data.patient.breathing === BreathingState.UNKNOWN ? Certainty.UNKNOWN : Certainty.KNOWN,
      establishedAt: null,
    },
    ...data.criticalInformation,
  ];

  const markArrived = () => {
    update.mutate(
      { status: IncidentStatus.HANDED_OFF },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.handoff(incidentId) });
        },
      },
    );
  };

  return (
    <ResponderShell>
      <div className="mx-auto w-full max-w-[1680px] px-6 py-6 md:px-10 xl:px-16">
        <Link to={routes.responder.list} className="flex items-center gap-2 text-sm font-bold text-[#536672]">
          <Icon name="chevron" className="size-4 rotate-180" /> All live incidents
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#ccd5dc] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className={`size-3 rounded-full ${escalated ? 'animate-pulse bg-[#cf382f]' : 'bg-[#15836d]'}`} />
              <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${escalated ? 'text-[#b32f28]' : 'text-[#087a65]'}`}>
                {escalated ? 'Escalated · Live' : arrived ? 'Responder arrived' : 'Active · Live'}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{EMERGENCY_LABEL[data.emergencyType]}</h1>
            <p className="mt-2 text-sm font-semibold text-[#687985]">
              {incidentId.slice(0, 8).toUpperCase()} · Started {elapsed(data.startedAt)}
            </p>
          </div>
          <button
            type="button"
            disabled={arrived || update.isPending}
            onClick={markArrived}
            className="min-h-11 rounded-lg border border-[#aebbc4] bg-white px-4 text-sm font-extrabold disabled:opacity-50"
          >
            {arrived ? 'Responder arrived' : update.isPending ? 'Updating…' : 'Mark responder arrived'}
          </button>
        </div>

        <section className="mt-6 rounded-xl border border-[#cbd5dc] bg-[#f4f7f6] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5a7268]">Shared picture</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Scene</p>
              <p className="mt-1 text-base font-extrabold">{EMERGENCY_LABEL[data.emergencyType]}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Breathing</p>
              <p className="mt-1 text-base font-extrabold">{BREATHING[data.patient.breathing]}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Still unknown</p>
              <p className="mt-1 text-base font-extrabold">
                {data.uncertainty.length === 0 ? 'None listed' : `${data.uncertainty.length} field${data.uncertainty.length === 1 ? '' : 's'}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Last confirmed action</p>
              <p className="mt-1 truncate text-base font-extrabold notranslate" translate="no">
                {actions.find((action) => action.status === ActionStatus.CONFIRMED)?.instruction ?? 'None yet'}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-xl border border-[#e5aaa5] bg-white">
              <div className="flex items-center gap-2 bg-[#b92f27] px-5 py-3 text-sm font-extrabold text-white">
                <Icon name="pulse" className="size-5" /> Critical warnings
              </div>
              {data.warnings.length === 0 ? (
                <p className="p-5 text-sm font-semibold text-[#75858f]">No warnings</p>
              ) : (
                <div className="grid divide-y divide-[#ead4d2] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {data.warnings.map((warning) => (
                    <div key={warning.message} className="p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#a93a32]">
                        {warning.severity === WarningSeverity.CRITICAL ? 'Attention' : warning.severity}
                      </p>
                      <p className="mt-2 text-base font-extrabold text-[#4a201d] notranslate" translate="no">
                        {warning.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">Critical facts</h2>
                <span className="text-xs font-semibold text-[#75858f]">Updated {time(data.generatedAt)}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stateFacts.map((fact) => (
                  <Fact key={`${fact.label}-${fact.value}`} fact={fact} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#cbd5dc] bg-white">
              <div className="border-b border-[#dbe1e5] px-5 py-4">
                <h2 className="text-lg font-extrabold">Actions and timeline</h2>
              </div>
              {actions.length === 0 && timeline.length === 0 ? (
                <p className="px-5 py-4 text-sm font-semibold text-[#75858f]">Nothing recorded yet</p>
              ) : (
                (actions.length > 0 ? actions : timeline).map((entry, index) => {
                  if ('instruction' in entry) {
                    return (
                      <div key={entry.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#e2e7ea] px-5 py-4 last:border-0">
                        <span className="text-xs font-extrabold tabular-nums text-[#71818c]">{index === 0 ? 'Now' : time(entry.givenAt)}</span>
                        <div>
                          <p className="text-sm font-extrabold notranslate" translate="no">
                            {entry.instruction}
                          </p>
                          <p className={`mt-1 text-xs font-semibold ${entry.status === ActionStatus.GIVEN ? 'text-[#9a6810]' : 'text-[#72828d]'}`}>
                            {actionDetail(entry.status)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={entry.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#e2e7ea] px-5 py-4 last:border-0">
                      <span className="text-xs font-extrabold tabular-nums text-[#71818c]">{time(entry.occurredAt)}</span>
                      <p className="text-sm font-extrabold">{entry.summary}</p>
                    </div>
                  );
                })
              )}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-[#cbd5dc] bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold">Location</h2>
                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-extrabold uppercase ${
                    place.shared ? 'bg-[#dff1eb] text-[#116a58]' : 'bg-[#f5f7f8] text-[#667783]'
                  }`}
                >
                  {place.shared ? 'Shared' : 'Unknown'}
                </span>
              </div>
              <div className="mt-4 flex min-h-44 items-center justify-center rounded-lg bg-[#dce8e8] map-grid">
                <span className="grid size-12 place-items-center rounded-full bg-[#087a65] text-white shadow-lg">
                  <Icon name="location" />
                </span>
              </div>
              <p className="mt-4 text-sm font-extrabold notranslate" translate="no">
                {place.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#6d7d87]">{place.detail}</p>
              {place.maps ? (
                <a
                  href={place.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg bg-[#142737] text-sm font-extrabold text-white"
                >
                  Open directions
                </a>
              ) : null}
            </section>
            <section className="rounded-xl border border-[#cbd5dc] bg-white p-5">
              <h2 className="font-extrabold">Connection</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Bystander phone</span>
                <span className={`font-extrabold ${live ? 'text-[#087a65]' : 'text-[#835f14]'}`}>{live ? 'Online' : 'Unknown'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Voice guidance</span>
                <span className="font-extrabold">{data.currentStepLabel ? 'Active' : 'Not started'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Protocol</span>
                <span className="font-extrabold">{data.currentProtocolName ?? 'Not started'}</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </ResponderShell>
  );
}

/** R2 · Active incident: warnings, facts, unknowns, state, actions, timeline — in that order. */
export function ResponderIncidentPage() {
  const { incidentId } = useParams<{ incidentId: string }>();
  return <ResponderGate>{incidentId ? <IncidentDetail incidentId={incidentId} /> : null}</ResponderGate>;
}

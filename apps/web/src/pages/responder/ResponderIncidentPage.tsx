import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActionStatus,
  AgeGroup,
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
import { IncidentMap } from '@/components/maps/IncidentMap';
import { Icon } from '@/components/ui';
import { emergencyCallHref, EMERGENCY_NUMBERS } from '@/config/emergency';
import { useResponderRealtime, useUpdateIncidentMutation } from '@/hooks';
import { incidentsApi, queryKeys } from '@/services/api';
import { routes } from '@/routes/paths';
import { useResponderUi } from '@/state';
import {
  AGE_LABEL,
  BREATHING_LABEL,
  caseId,
  CONSCIOUSNESS_LABEL,
  drivingDirectionsUrl,
  elapsedClock,
  EMERGENCY_LABEL,
  emsCallStatus,
  EMS_LABEL,
  LANGUAGE_LABEL,
  signOutIfUnauthorized,
  useNow,
} from './format';
import { ResponderGate } from './ResponderGate';
import { ResponderShell } from './ResponderShell';

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function elapsed(iso: string, now: number): string {
  return `${elapsedClock(iso, now)} on scene clock`;
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
      ? drivingDirectionsUrl(location.latitude, location.longitude)
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
  if (status === ActionStatus.CONFIRMED) return 'Bystander confirmed this was done';
  if (status === ActionStatus.UNABLE) return 'Bystander could not do this';
  if (status === ActionStatus.SKIPPED) return 'Skipped';
  return 'Told to the bystander — not yet confirmed';
}

function IncidentDetail({ incidentId }: { incidentId: string }) {
  const queryClient = useQueryClient();
  const { connection } = useResponderUi();
  const now = useNow();
  useResponderRealtime(incidentId);
  const update = useUpdateIncidentMutation(incidentId);
  const incident = useQuery({
    queryKey: queryKeys.incidents.detail(incidentId),
    queryFn: ({ signal }) => incidentsApi.getForResponder(incidentId, { signal }),
  });
  const handoff = useQuery({
    queryKey: queryKeys.incidents.handoff(incidentId),
    queryFn: ({ signal }) => incidentsApi.getHandoff(incidentId, { signal }),
  });

  useEffect(() => signOutIfUnauthorized(handoff.error ?? incident.error), [handoff.error, incident.error]);

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
          <button type="button" onClick={() => void handoff.refetch()} className="mt-3 text-sm font-extrabold text-[#0a5c4e] underline underline-offset-4">
            Try again
          </button>
        </div>
      </ResponderShell>
    );
  }

  const data = handoff.data;
  const timeline = [...data.timeline].sort((a, b) => b.sequence - a.sequence);
  const actions = [...data.actionsTaken].sort((a, b) => b.givenAt.localeCompare(a.givenAt));
  const log = [
    ...actions.map((entry) => ({ at: entry.givenAt, action: entry })),
    ...timeline.map((entry) => ({ at: entry.occurredAt, event: entry })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  const place = locationLine(data);
  const escalated = data.status === IncidentStatus.ESCALATED || data.escalationStatus === EscalationState.ESCALATED;
  const arrived = data.status === IncidentStatus.HANDED_OFF || data.status === IncidentStatus.CLOSED;
  const live = connection === ConnectionStatus.CONNECTED;
  const ems = emsCallStatus(data.actionsTaken);
  const spokenLanguage = incident.data?.language;

  const stateFacts: HandoffFact[] = [
    {
      label: 'Patient responding',
      value: CONSCIOUSNESS_LABEL[data.patient.consciousness],
      certainty: data.patient.consciousness === ConsciousnessState.UNKNOWN ? Certainty.UNKNOWN : Certainty.KNOWN,
      establishedAt: null,
    },
    {
      label: 'Breathing',
      value: BREATHING_LABEL[data.patient.breathing],
      certainty: data.patient.breathing === BreathingState.UNKNOWN ? Certainty.UNKNOWN : Certainty.KNOWN,
      establishedAt: null,
    },
    {
      label: 'Age',
      value: AGE_LABEL[data.patient.ageGroup],
      certainty: data.patient.ageGroup === AgeGroup.UNKNOWN ? Certainty.UNKNOWN : Certainty.KNOWN,
      establishedAt: null,
    },
    ...data.criticalInformation.filter(
      (fact) => fact.label !== 'Consciousness' && fact.label !== 'Breathing' && fact.label !== 'Emergency type' && fact.label !== 'Age group',
    ),
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
          <Icon name="chevron" className="size-4 rotate-180" /> Look up another scene
        </Link>
        <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#ccd5dc] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className={`size-3 rounded-full ${escalated ? 'animate-pulse bg-[#cf382f]' : 'bg-[#15836d]'}`} />
              <p className={`text-xs font-extrabold uppercase tracking-[0.14em] ${escalated ? 'text-[#b32f28]' : 'text-[#087a65]'}`}>
                {escalated ? 'Escalated · Live' : arrived ? 'Crew on scene' : 'Active · Live'}
              </p>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">{EMERGENCY_LABEL[data.emergencyType]}</h1>
            <p className="mt-2 text-sm font-semibold text-[#687985]">
              Scene {incident.data?.accessCode ?? caseId(incidentId)} · {elapsed(data.startedAt, now)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ems !== 'confirmed' ? (
              <a
                href={emergencyCallHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#b3261e] px-4 text-sm font-extrabold text-white"
              >
                Call {EMERGENCY_NUMBERS.ambulance}
              </a>
            ) : null}
            <button
              type="button"
              disabled={arrived || update.isPending}
              onClick={markArrived}
              className="min-h-11 rounded-lg border border-[#8a9aa6] bg-white px-4 text-sm font-extrabold text-[#12202d] disabled:opacity-50"
            >
              {arrived ? 'On scene' : update.isPending ? 'Updating…' : 'On scene'}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-[#cbd5dc] bg-[#f4f7f6] p-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5a7268]">What the crew needs first</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Patient</p>
              <p className="mt-1 text-base font-extrabold">
                {CONSCIOUSNESS_LABEL[data.patient.consciousness]} · {BREATHING_LABEL[data.patient.breathing]}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">907</p>
              <p className="mt-1 text-base font-extrabold">{EMS_LABEL[ems]}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#71818c]">Bystander language</p>
              <p className="mt-1 text-base font-extrabold">{spokenLanguage ? LANGUAGE_LABEL[spokenLanguage] : 'Unknown'}</p>
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
                <h2 className="text-lg font-extrabold">What has already happened</h2>
              </div>
              {log.length === 0 ? (
                <p className="px-5 py-4 text-sm font-semibold text-[#75858f]">Nothing recorded yet</p>
              ) : (
                log.map((entry, index) => {
                  if ('action' in entry) {
                    const item = entry.action;
                    return (
                      <div key={item.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#e2e7ea] px-5 py-4 last:border-0">
                        <span className="text-xs font-extrabold tabular-nums text-[#71818c]">{index === 0 ? 'Now' : time(item.givenAt)}</span>
                        <div>
                          <p className="text-sm font-extrabold notranslate" translate="no">
                            {item.instruction}
                          </p>
                          <p className={`mt-1 text-xs font-semibold ${item.status === ActionStatus.GIVEN ? 'text-[#9a6810]' : 'text-[#72828d]'}`}>
                            {actionDetail(item.status)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  const item = entry.event;
                  return (
                    <div key={item.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#e2e7ea] px-5 py-4 last:border-0">
                      <span className="text-xs font-extrabold tabular-nums text-[#71818c]">{time(item.occurredAt)}</span>
                      <p className="text-sm font-extrabold">{item.summary}</p>
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
              <IncidentMap
                latitude={data.location?.latitude ?? null}
                longitude={data.location?.longitude ?? null}
                accuracyMeters={data.location?.accuracyMeters}
                title={place.title}
              />
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
                  Drive to scene
                </a>
              ) : null}
            </section>
            <section className="rounded-xl border border-[#cbd5dc] bg-white p-5">
              <h2 className="font-extrabold">On the line</h2>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Bystander phone</span>
                <span className={`font-extrabold ${live ? 'text-[#087a65]' : 'text-[#835f14]'}`}>{live ? 'On the line' : 'Unknown'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Language</span>
                <span className="font-extrabold">{spokenLanguage ? LANGUAGE_LABEL[spokenLanguage] : 'Unknown'}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-[#647681]">Guidance now</span>
                <span className="font-extrabold">{data.currentStepLabel ?? 'Not started'}</span>
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

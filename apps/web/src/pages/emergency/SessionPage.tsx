import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActionStatus,
  IncidentStatus,
  ProtocolStepKind,
  VoiceSessionPhase,
  type ButtonTurnRequest,
  type Incident,
  type ProtocolStep,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { Brand, Icon, VoicePhaseIndicator } from '@/components/ui';
import { emergencyCallHref } from '@/config/emergency';
import {
  useButtonTurnMutation,
  useConnectionStatus,
  useDeresVoice,
  useIncidentLocation,
  useIncidentQuery,
  useProtocolsQuery,
  useUpdateIncidentMutation,
} from '@/hooks';
import type { LocationShareStatus } from '@/hooks/useIncidentLocation';
import { emergencyCopy, type EmergencyCopy } from '@/i18n/emergencyCopy';
import { queryKeys } from '@/services/api';
import { isLocalIncidentId } from '@/services/protocol/localIncident';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';

/** The usual path through the protocol, used to preview steps not reached yet. It branches. */
const USUAL_PATH = [
  'step-check-response',
  'step-call-ems',
  'step-open-airway',
  'step-check-breathing',
  'step-cpr',
  'step-wait-for-help',
];

type StepState = 'done' | 'current' | 'todo';

function progressSteps(incident: Incident, arrived: boolean): { id: string; state: StepState }[] {
  const { completedStepIds, currentStepId } = incident.state;
  const seen = [...new Set(completedStepIds)];
  if (currentStepId && !seen.includes(currentStepId)) seen.push(currentStepId);

  const anchor = currentStepId ?? null;
  const from = anchor ? USUAL_PATH.indexOf(anchor) : -1;
  const ahead = anchor === null ? USUAL_PATH : from >= 0 ? USUAL_PATH.slice(from + 1) : [];
  const ids = [...seen, ...ahead.filter((id) => !seen.includes(id))];

  return ids.map((id) => ({
    id,
    state: arrived || (completedStepIds.includes(id) && id !== currentStepId) ? 'done' : id === currentStepId ? 'current' : 'todo',
  }));
}

function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function ElapsedClock({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <p className="text-3xl font-extrabold tracking-[-0.04em] tabular-nums" aria-label="Time since the emergency started">
      {clock(now - new Date(since).getTime())}
    </p>
  );
}

function answerLabel(copy: EmergencyCopy, press: ButtonTurnRequest | undefined): string | null {
  if (press?.kind !== 'answer') return null;
  return press.answer === 'yes' ? copy.yes : press.answer === 'no' ? copy.no : copy.notSure;
}

function Call907({ label }: { label: string }) {
  return (
    <a
      href={emergencyCallHref}
      className="flex min-h-14 shrink-0 items-center gap-2 rounded-full bg-[#f35d43] px-5 text-base font-extrabold text-[#190d0a] sm:px-6"
    >
      <Icon name="phone" className="size-5" />
      {label}
    </a>
  );
}

function StatusRow({
  icon,
  label,
  value,
  warning = false,
  onClick,
}: {
  icon: 'phone' | 'location' | 'mic';
  label: string;
  value: string;
  warning?: boolean;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          warning ? 'bg-[#f35d43]/15 text-[#ff8c78]' : 'bg-white/7 text-[#86e9c6]'
        }`}
      >
        <Icon name={icon} className="size-5" />
      </span>
      <span className="text-left">
        <span className="block text-xs font-semibold text-white/38">{label}</span>
        <span className={`mt-1 block text-sm font-extrabold ${warning ? 'text-[#ff8c78]' : 'text-white'}`}>{value}</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex w-full gap-3 text-left">
        {inner}
      </button>
    );
  }
  if (icon === 'phone') {
    return (
      <a href={emergencyCallHref} className="flex gap-3">
        {inner}
      </a>
    );
  }
  return <div className="flex gap-3">{inner}</div>;
}

function StepControls({
  step,
  copy,
  busy,
  press,
  onArrived,
}: {
  step: ProtocolStep;
  copy: EmergencyCopy;
  busy: boolean;
  press: (input: ButtonTurnRequest) => void;
  onArrived: () => void;
}) {
  switch (step.kind) {
    case ProtocolStepKind.QUESTION:
    case ProtocolStepKind.ASSESSMENT:
      return (
        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              ['yes', copy.yes, 'bg-white text-[#07130f]'],
              ['no', copy.no, 'bg-[#f35d43] text-[#190d0a]'],
              ['unsure', copy.notSure, 'bg-white text-[#07130f]'],
            ] as const
          ).map(([answer, label, className]) => (
            <button
              key={answer}
              type="button"
              disabled={busy}
              onClick={() => press({ kind: 'answer', answer })}
              className={`min-h-12 rounded-xl px-3 text-sm font-extrabold disabled:opacity-60 md:min-h-14 md:text-base ${className}`}
            >
              {label}
            </button>
          ))}
        </div>
      );
    case ProtocolStepKind.ACTION:
    case ProtocolStepKind.ESCALATION:
      return (
        <div className="grid grid-cols-2 gap-3">
          {step.requiresConfirmation ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => press({ kind: 'action', status: 'confirmed' })}
              className="min-h-16 rounded-2xl bg-[#86e9c6] px-5 text-lg font-extrabold text-[#07130f] disabled:opacity-60"
            >
              {copy.done}
            </button>
          ) : (
            <a
              href={emergencyCallHref}
              className="flex min-h-16 items-center justify-center rounded-2xl bg-[#86e9c6] px-5 text-lg font-extrabold text-[#07130f]"
            >
              {copy.callShort}
            </a>
          )}
          <button
            type="button"
            disabled={busy || !step.requiresConfirmation}
            onClick={() => press({ kind: 'action', status: 'unable' })}
            className="min-h-16 rounded-2xl border border-white/25 px-5 text-base font-extrabold disabled:opacity-40"
          >
            {copy.cantDo}
          </button>
        </div>
      );
    case ProtocolStepKind.EXIT:
      return (
        <button
          type="button"
          onClick={onArrived}
          className="min-h-16 w-full rounded-2xl bg-[#86e9c6] px-5 text-lg font-extrabold text-[#07130f]"
        >
          {copy.helpArrived}
        </button>
      );
  }
}

function OpeningControls({
  copy,
  busy,
  onCollapsed,
  onOther,
}: {
  copy: EmergencyCopy;
  busy: boolean;
  onCollapsed: () => void;
  onOther: () => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={busy}
        onClick={onCollapsed}
        className="min-h-12 rounded-xl bg-[#86e9c6] px-5 text-sm font-extrabold text-[#07130f] disabled:opacity-60 md:min-h-14 md:text-base"
      >
        {copy.collapsed}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onOther}
        className="min-h-12 rounded-xl border border-white/25 px-5 text-sm font-extrabold text-white disabled:opacity-60 md:min-h-14 md:text-base"
      >
        {copy.somethingElse}
      </button>
    </div>
  );
}

function Shell({
  children,
  copy,
  language,
  showCall = true,
}: {
  children: ReactNode;
  copy: EmergencyCopy;
  language: string;
  showCall?: boolean;
}) {
  return (
    <main className="min-h-dvh w-full bg-[#07130f] text-white" lang={language}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col px-6 py-6 md:px-10 md:py-8 xl:px-16">
        <header className="flex items-center justify-between gap-4">
          <Brand dark />
          {showCall ? <Call907 label={copy.callShort} /> : null}
        </header>
        <div className="flex flex-1 flex-col justify-center py-12">{children}</div>
      </div>
    </main>
  );
}

function UnsupportedScreen({ copy, language, onHome }: { copy: EmergencyCopy; language: string; onHome: () => void }) {
  return (
    <main className="flex min-h-dvh w-full flex-col bg-[#401b15] px-6 py-6 text-white md:px-10 md:py-8 xl:px-16" lang={language}>
      <Brand dark />
      <section className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col justify-center py-12 md:py-16">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#ff9b88]">{copy.cannotGuide}</p>
        <h1 className="mt-4 max-w-3xl text-[clamp(2.1rem,3.2vw,3.5rem)] font-extrabold leading-[1.08] tracking-[-0.04em]">{copy.callNowHeadline}</h1>
        <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white/65 md:text-lg">{copy.tellOperator}</p>
        <a
          href={emergencyCallHref}
          className="mt-8 inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-[#ff6b50] text-lg font-extrabold text-[#2e100b] md:min-h-16"
        >
          <Icon name="phone" className="size-6" />
          {copy.callShort}
        </a>
        <button type="button" onClick={onHome} className="mt-6 min-h-14 text-sm font-bold text-white/60">
          {copy.returnStart}
        </button>
      </section>
    </main>
  );
}

function CompleteScreen({
  copy,
  language,
  steps,
  showHandoff,
  onToggleHandoff,
  onHome,
}: {
  copy: EmergencyCopy;
  language: string;
  steps: { id: string; state: StepState }[];
  showHandoff: boolean;
  onToggleHandoff: () => void;
  onHome: () => void;
}) {
  return (
    <main className="min-h-dvh w-full bg-[#dff4eb] text-[#0d2c22]" lang={language}>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col px-6 py-6 md:px-10 md:py-8 xl:px-16">
        <Brand />
        <section className="flex flex-1 flex-col justify-center py-12 md:max-w-3xl">
          <div className="grid size-16 place-items-center rounded-full bg-[#16775a] text-white">
            <Icon name="check" className="size-8" />
          </div>
          <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.18em] text-[#16775a]">{copy.helpArrived}</p>
          <h1 className="mt-3 text-[clamp(2.1rem,3.2vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.04em]">{copy.stayedWithThem}</h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-[#48675d] md:text-lg">{copy.handoffHint}</p>
          {showHandoff ? (
            <ol className="mt-8 space-y-3">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center gap-3 text-sm font-bold">
                  <span className="grid size-6 place-items-center rounded-full bg-[#16775a] text-white">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  {copy.stepNames[step.id] ?? step.id}
                </li>
              ))}
            </ol>
          ) : null}
          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onToggleHandoff}
              className="min-h-12 rounded-xl bg-[#123d30] px-6 text-sm font-extrabold text-white md:min-h-14 md:text-base"
            >
              {copy.viewHandoff}
            </button>
            <button type="button" onClick={onHome} className="min-h-12 rounded-xl border-2 border-[#9dbcb0] px-6 text-sm font-extrabold md:min-h-14 md:text-base">
              {copy.newEmergency}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/** E3 · Active emergency. Fully usable without the microphone. */
export function SessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useEmergencySession();
  const { incidentId, language } = session;
  const copy = emergencyCopy(language);

  const incident = useIncidentQuery(incidentId);
  const protocols = useProtocolsQuery();
  const buttons = useButtonTurnMutation(incidentId);
  const update = useUpdateIncidentMutation(incidentId ?? 'unknown');
  const voice = useDeresVoice(incidentId, language);
  const location = useIncidentLocation(incidentId);
  const { browserOnline } = useConnectionStatus({ probeApi: false });

  const [unsupported, setUnsupported] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [showHandoff, setShowHandoff] = useState(false);
  const [offlineGuide, setOfflineGuide] = useState(() => isLocalIncidentId(incidentId));
  const [buttonTurn, setButtonTurn] = useState<{
    turn: VoiceTurnResponse | null;
    voiceTurnAtPress: VoiceTurnResponse | null;
  }>({ turn: null, voiceTurnAtPress: null });

  useEffect(() => {
    if (!incidentId || !voice.lastTurn || isLocalIncidentId(incidentId)) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) });
  }, [voice.lastTurn, incidentId, queryClient]);

  const latestTurn = voice.lastTurn !== buttonTurn.voiceTurnAtPress ? voice.lastTurn : buttonTurn.turn;
  const notice = latestTurn?.source === 'safe_fallback' ? latestTurn.reply : null;

  if (!incidentId) return <Navigate to={routes.home} replace />;

  const startOver = () => {
    session.reset();
    session.setLanguage(language);
    navigate(routes.home);
  };

  if (incident.isPending) {
    return (
      <Shell copy={copy} language={language}>
        <p className="text-2xl font-extrabold" role="status">
          {copy.starting}
        </p>
      </Shell>
    );
  }
  if (incident.isError) {
    return (
      <Shell copy={copy} language={language}>
        <p className="text-2xl font-extrabold" role="alert">
          {copy.sendFailed}
        </p>
        <button type="button" onClick={() => void incident.refetch()} className="mt-6 min-h-14 text-sm font-bold text-white/60">
          {copy.repeat}
        </button>
      </Shell>
    );
  }

  const state = incident.data.state;
  const protocol = protocols.data?.find((item) => item.id === state.currentProtocolId) ?? null;
  const step = protocol?.steps.find((item) => item.id === state.currentStepId) ?? null;
  const steps = progressSteps(incident.data, arrived);
  const currentIndex = Math.max(
    0,
    steps.findIndex((item) => item.state === 'current'),
  );
  const emsConfirmed = state.actions.some(
    (action) => action.stepId === 'step-call-ems' && action.status === ActionStatus.CONFIRMED,
  );

  const press = (input: ButtonTurnRequest) => {
    const voiceTurnAtPress = voice.lastTurn;
    setButtonTurn({ turn: null, voiceTurnAtPress });
    buttons.mutate(input, {
      onSuccess: (turn) => {
        setButtonTurn({ turn, voiceTurnAtPress });
        if (turn.local) setOfflineGuide(true);
      },
    });
  };

  const onArrived = () => {
    setArrived(true);
    voice.disconnect();
    if (
      !isLocalIncidentId(incident.data.id) &&
      incident.data.status !== IncidentStatus.HANDED_OFF &&
      incident.data.status !== IncidentStatus.CLOSED
    ) {
      update.mutate({ status: IncidentStatus.HANDED_OFF });
    }
  };

  if (arrived) {
    return (
      <CompleteScreen
        copy={copy}
        language={language}
        steps={steps}
        showHandoff={showHandoff}
        onToggleHandoff={() => setShowHandoff((open) => !open)}
        onHome={startOver}
      />
    );
  }

  if (unsupported) {
    return <UnsupportedScreen copy={copy} language={language} onHome={startOver} />;
  }

  const pendingAnswer = buttons.isPending ? answerLabel(copy, buttons.variables) : null;
  const isQuestion = step?.kind === ProtocolStepKind.QUESTION || step?.kind === ProtocolStepKind.ASSESSMENT;
  const isConfirmAction =
    (step?.kind === ProtocolStepKind.ACTION || step?.kind === ProtocolStepKind.ESCALATION) && step.requiresConfirmation;
  const voicePhase = voice.available ? voice.phase : VoiceSessionPhase.ERROR;
  const locationStatus: LocationShareStatus = location.status;
  const locationValue =
    locationStatus === 'shared'
      ? copy.locationShared
      : locationStatus === 'requesting' || locationStatus === 'idle'
        ? copy.locationRequesting
        : copy.locationNotShared;
  const headline = step ? (step.prompt[language] ?? step.prompt.en ?? step.label) : copy.whatHappened;
  const kindLabel = step ? copy.kind[step.kind] : copy.openingLabel;
  const support = pendingAnswer
    ? copy.youAnswered(pendingAnswer)
    : notice
      ? notice
      : voice.shownText
        ? voice.shownText
        : isQuestion
          ? copy.answerHint
          : isConfirmAction
            ? copy.actionHint
            : copy.startCaption;

  return (
    <main className="min-h-dvh w-full bg-[#07130f] text-white" lang={language}>
      {!browserOnline || offlineGuide ? (
        <p className="flex min-h-11 w-full items-center justify-center gap-2 bg-[#e7b84f] px-4 text-center text-xs font-extrabold text-[#201b0d]">
          <Icon name="signal" className="size-4" />
          {copy.offlineLive}
        </p>
      ) : null}
      <div className="grid min-h-dvh w-full md:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-h-dvh flex-col px-6 py-6 md:px-10 md:py-8 xl:px-16">
          <header className="flex items-center justify-between gap-4">
            <Brand dark />
            <Call907 label={copy.callShort} />
          </header>

          <div className="mt-7 flex items-center gap-3 lg:mt-10">
            <div className="flex flex-1 gap-1.5" aria-hidden="true">
              {steps.map((item) => (
                <span
                  key={item.id}
                  className={`h-1 flex-1 rounded-full ${item.state === 'todo' ? 'bg-white/14' : 'bg-[#86e9c6]'}`}
                />
              ))}
            </div>
            <p className="text-xs font-bold tabular-nums text-white/50">
              {String(currentIndex + 1).padStart(2, '0')} / {String(Math.max(steps.length, 1)).padStart(2, '0')}
            </p>
          </div>

          {buttons.isError ? (
            <p className="mt-4 text-sm font-bold text-[#ff8c78]" role="alert">
              {copy.sendFailed}
            </p>
          ) : null}

          <div className="flex flex-1 flex-col justify-center py-8 md:py-10">
            <div className="notranslate" translate="no" lang={language}>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[#86e9c6]">{kindLabel}</p>
              <h1 className="max-w-4xl text-[clamp(1.85rem,2.6vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.035em]">
                {headline}
              </h1>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-relaxed text-white/55 md:text-base">{support}</p>
            </div>
          </div>

          <div className="grid items-center gap-5 border-t border-white/12 pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8">
            <div className="grid gap-3">
              {pendingAnswer ? (
                <p className="text-sm font-bold text-[#86e9c6]">{copy.preparingNext}</p>
              ) : step ? (
                <StepControls step={step} copy={copy} busy={buttons.isPending} press={press} onArrived={onArrived} />
              ) : (
                <OpeningControls
                  copy={copy}
                  busy={buttons.isPending}
                  onCollapsed={() => press({ kind: 'start', emergency: 'collapsed' })}
                  onOther={() => setUnsupported(true)}
                />
              )}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={buttons.isPending || !step}
                  onClick={() => press({ kind: 'repeat' })}
                  className="flex min-h-12 items-center gap-2 text-sm font-bold text-white/65 disabled:opacity-40"
                >
                  <Icon name="volume" className="size-5" />
                  {copy.repeatInstruction}
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <VoicePhaseIndicator
                phase={voicePhase}
                label={copy.phase[voicePhase]}
                hint={isQuestion ? copy.answerHint : isConfirmAction ? copy.actionHint : undefined}
                lang={language}
                level={voice.micLevel}
                onMicPress={voice.press}
              />
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-white/10 bg-[#0d1c17] p-6 md:flex md:flex-col xl:p-8" aria-label={copy.whatsHappening}>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/38">{copy.sessionAside}</p>
          <div className="mt-3 flex items-baseline justify-between">
            <ElapsedClock since={incident.data.createdAt} />
            <span className="flex items-center gap-2 text-xs font-bold text-[#86e9c6]">
              <span className="size-2 rounded-full bg-[#86e9c6]" /> {copy.live}
            </span>
          </div>
          <div className="mt-9 space-y-6">
            <StatusRow
              icon="phone"
              label={copy.emsService}
              value={emsConfirmed ? copy.callConfirmed : copy.notConfirmed}
              warning={!emsConfirmed}
            />
            <StatusRow
              icon="location"
              label={copy.locationTitle}
              value={locationValue}
              warning={locationStatus !== 'shared'}
              onClick={locationStatus === 'shared' || locationStatus === 'requesting' ? undefined : location.request}
            />
            <StatusRow
              icon="mic"
              label={copy.liveEmergency}
              value={voicePhase === VoiceSessionPhase.ERROR ? copy.voiceUnavailable : copy.voiceReady}
              warning={voicePhase === VoiceSessionPhase.ERROR}
            />
          </div>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/38">{copy.progressTitle}</p>
            <div className="mt-6 space-y-0">
              {steps.map((item, index) => (
                <div key={item.id} className="relative flex min-h-12 gap-3">
                  {index < steps.length - 1 ? (
                    <span
                      className={`absolute left-[11px] top-6 h-full w-px ${
                        item.state === 'todo' ? 'bg-white/12' : 'bg-[#86e9c6]/45'
                      }`}
                    />
                  ) : null}
                  <span
                    className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${
                      item.state === 'done'
                        ? 'bg-[#86e9c6] text-[#07130f]'
                        : item.state === 'current'
                          ? 'border border-[#86e9c6] text-[#86e9c6]'
                          : 'border border-white/15 text-white/30'
                    }`}
                  >
                    {item.state === 'done' ? <Icon name="check" className="size-3.5" /> : index + 1}
                  </span>
                  <p className={`pt-0.5 text-sm font-bold ${item.state === 'current' ? 'text-white' : 'text-white/40'}`}>
                    {copy.stepNames[item.id] ?? item.id}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-auto text-xs leading-relaxed text-white/35">
            {copy.protocolNote} · {copy.languageName}
          </p>
        </aside>
      </div>
    </main>
  );
}

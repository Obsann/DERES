import { useEffect, useState, type CSSProperties } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  EscalationState,
  IncidentStatus,
  ProtocolStepKind,
  VoiceSessionPhase,
  type ButtonTurnRequest,
  type ProtocolStep,
  type VoiceTurnResponse,
} from '@voicesos/shared';
import { Banner, Button, ButtonLink, InstructionCard, VoicePhaseIndicator } from '@/components/ui';
import { ApiErrorState, ApiLoadingState } from '@/components/ApiState';
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
import { emergencyCopy, type EmergencyCopy } from '@/i18n/emergencyCopy';
import { queryKeys } from '@/services/api';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';

const gap = (value: string) => ({ '--d-stack-gap': value }) as CSSProperties;
const rowGap = (value: string) => ({ '--d-row-gap': value }) as CSSProperties;

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
        <div className="d-stack" style={gap('var(--d-space-2)')}>
          <div className="d-row" style={rowGap('var(--d-space-2)')}>
            <Button size="lg" icon="check" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'answer', answer: 'yes' })}>
              {copy.yes}
            </Button>
            <Button size="lg" icon="x" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'answer', answer: 'no' })}>
              {copy.no}
            </Button>
          </div>
          <div className="d-row" style={rowGap('var(--d-space-2)')}>
            <Button size="lg" variant="secondary" icon="question" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'answer', answer: 'unsure' })}>
              {copy.notSure}
            </Button>
            <Button size="lg" variant="secondary" icon="repeat" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'repeat' })}>
              {copy.repeat}
            </Button>
          </div>
        </div>
      );
    case ProtocolStepKind.ACTION:
    case ProtocolStepKind.ESCALATION:
      return (
        <div className="d-stack" style={gap('var(--d-space-2)')}>
          {step.id === 'step-call-ems' || step.kind === ProtocolStepKind.ESCALATION ? (
            <ButtonLink variant="emergency" size="lg" block icon="phone" href={emergencyCallHref}>
              {copy.callEmergency}
            </ButtonLink>
          ) : null}
          {step.requiresConfirmation ? (
            <>
              <Button size="lg" block icon="check" disabled={busy} onClick={() => press({ kind: 'action', status: 'confirmed' })}>
                {copy.done}
              </Button>
              <div className="d-row" style={rowGap('var(--d-space-2)')}>
                <Button size="lg" variant="secondary" icon="x" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'action', status: 'unable' })}>
                  {copy.cantDo}
                </Button>
                <Button size="lg" variant="secondary" icon="repeat" disabled={busy} style={{ flex: 1 }} onClick={() => press({ kind: 'repeat' })}>
                  {copy.repeat}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      );
    case ProtocolStepKind.EXIT:
      return (
        <div className="d-stack" style={gap('var(--d-space-2)')}>
          <Button size="lg" variant="secondary" block icon="check" onClick={onArrived}>
            {copy.helpArrived}
          </Button>
          <Button size="lg" variant="quiet" block icon="repeat" disabled={busy} onClick={() => press({ kind: 'repeat' })}>
            {copy.repeat}
          </Button>
        </div>
      );
  }
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
  const [buttonTurn, setButtonTurn] = useState<{
    turn: VoiceTurnResponse | null;
    voiceTurnAtPress: VoiceTurnResponse | null;
  }>({ turn: null, voiceTurnAtPress: null });

  useEffect(() => {
    if (!incidentId || !voice.lastTurn) return;
    void queryClient.invalidateQueries({ queryKey: queryKeys.incidents.detail(incidentId) });
  }, [voice.lastTurn, incidentId, queryClient]);

  // Whichever turn came last, voice or button, decides the fallback notice.
  const latestTurn = voice.lastTurn !== buttonTurn.voiceTurnAtPress ? voice.lastTurn : buttonTurn.turn;
  const notice = latestTurn?.source === 'safe_fallback' ? latestTurn.reply : null;

  if (!incidentId) return <Navigate to={routes.home} replace />;
  if (incident.isPending) {
    return (
      <main className="d-emergency-layout">
        <ApiLoadingState label={copy.starting} />
      </main>
    );
  }
  if (incident.isError) {
    return (
      <main className="d-emergency-layout d-stack">
        <ApiErrorState error={incident.error} onRetry={() => void incident.refetch()} />
        <ButtonLink variant="emergency" size="lg" block icon="phone" href={emergencyCallHref}>
          {copy.callEmergency}
        </ButtonLink>
      </main>
    );
  }

  const state = incident.data.state;
  const protocol = protocols.data?.find((item) => item.id === state.currentProtocolId) ?? null;
  const step = protocol?.steps.find((item) => item.id === state.currentStepId) ?? null;
  const escalated = state.escalationStatus !== EscalationState.NONE;

  const press = (input: ButtonTurnRequest) => {
    const voiceTurnAtPress = voice.lastTurn;
    setButtonTurn({ turn: null, voiceTurnAtPress });
    buttons.mutate(input, {
      onSuccess: (turn) => setButtonTurn({ turn, voiceTurnAtPress }),
    });
  };

  const onArrived = () => {
    setArrived(true);
    voice.disconnect();
    if (incident.data.status !== IncidentStatus.HANDED_OFF && incident.data.status !== IncidentStatus.CLOSED) {
      update.mutate({ status: IncidentStatus.HANDED_OFF });
    }
  };

  const startOver = () => {
    session.reset();
    session.setLanguage(language);
    navigate(routes.home);
  };

  const onMicPress = () => {
    if (voice.phase === VoiceSessionPhase.IDLE || voice.phase === VoiceSessionPhase.ERROR) void voice.connect();
    else voice.disconnect();
  };

  const locationLine =
    location.status === 'shared'
      ? copy.locationShared
      : location.status === 'requesting'
        ? copy.locationRequesting
        : location.status === 'idle'
          ? null
          : copy.locationNotShared;

  let card;
  if (arrived) {
    card = (
      <div className="d-stack">
        <Banner tone="success" title={copy.arrivedTitle}>
          <span lang={language}>{copy.arrivedBody}</span>
        </Banner>
        <Button size="lg" variant="secondary" block onClick={startOver}>
          {copy.newEmergency}
        </Button>
      </div>
    );
  } else if (unsupported) {
    card = (
      <InstructionCard kind={ProtocolStepKind.ESCALATION} kindLabel={copy.kind.escalation} text={copy.onlyCollapse} lang={language}>
        <ButtonLink variant="emergency" size="lg" block icon="phone" href={emergencyCallHref}>
          {copy.callEmergency}
        </ButtonLink>
      </InstructionCard>
    );
  } else if (!step) {
    card = (
      <InstructionCard kind={ProtocolStepKind.QUESTION} kindLabel={copy.kind.question} text={copy.whatHappened} lang={language}>
        <div className="d-stack" style={gap('var(--d-space-2)')}>
          <Button size="lg" block icon="alert" disabled={buttons.isPending} onClick={() => press({ kind: 'start', emergency: 'collapsed' })}>
            {copy.collapsed}
          </Button>
          <Button size="lg" variant="secondary" block onClick={() => setUnsupported(true)}>
            {copy.somethingElse}
          </Button>
        </div>
      </InstructionCard>
    );
  } else {
    card = (
      <InstructionCard
        kind={step.kind}
        kindLabel={copy.kind[step.kind]}
        text={step.prompt[language] ?? step.prompt.en ?? step.label}
        progress={copy.step(state.completedStepIds.length + 1)}
        lang={language}
      >
        <StepControls step={step} copy={copy} busy={buttons.isPending} press={press} onArrived={onArrived} />
      </InstructionCard>
    );
  }

  return (
    <main className="d-emergency-layout d-stack" lang={language} style={gap('var(--d-space-4)')}>
      {escalated && !arrived && step?.id !== 'step-call-ems' ? (
        <ButtonLink variant="emergency" size="lg" block icon="phone" href={emergencyCallHref}>
          {copy.callEmergency}
        </ButtonLink>
      ) : null}

      {!browserOnline ? (
        <Banner tone="warning" icon="wifiOff" title={copy.offline}>
          {copy.offlineBody}
        </Banner>
      ) : null}
      {buttons.isError ? <Banner tone="warning" title={copy.sendFailed} /> : null}
      {notice ? <Banner tone="info" title={notice} /> : null}
      {voice.available && (voice.errorCode || voice.phase === VoiceSessionPhase.ERROR) ? (
        <Banner tone="warning" icon="micOff" title={copy.voiceUnavailable}>
          {copy.voiceUnavailableBody}
        </Banner>
      ) : null}

      {card}

      {voice.available && !arrived ? (
        <VoicePhaseIndicator phase={voice.phase} label={copy.phase[voice.phase]} onMicPress={onMicPress} />
      ) : null}

      {locationLine && !arrived ? (
        <p style={{ margin: 0, textAlign: 'center', color: 'var(--d-ink-muted)', fontSize: 'var(--d-text-sm)' }}>
          {locationLine}
        </p>
      ) : null}
    </main>
  );
}

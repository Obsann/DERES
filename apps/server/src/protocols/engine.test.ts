import { describe, expect, it } from 'vitest';
import {
  ActionStatus,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  Language,
} from '@voicesos/shared';
import { ProtocolViolationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { applyCommand } from '../incidents/stateEngine.js';
import { selectPublishedProtocol } from './engine.js';
import {
  answerProtocolStep,
  giveProtocolAction,
  rejectUnsupportedAction,
  resolveProtocolAction,
  startProtocol,
} from './execute.js';
import { foundationProtocol } from './fixtures/foundationProtocol.js';

const AT = '2026-09-22T18:00:00.000Z';

function incidentReadyForProtocol() {
  const opened = initialIncident({
    id: 'incident-protocol',
    sessionId: 'session-protocol',
    language: Language.ENGLISH,
    at: AT,
  });
  return applyCommand(
    opened,
    {
      kind: 'set_emergency_type',
      emergencyType: EmergencyType.UNCONSCIOUS,
      confidence: 0.9,
      source: EventSource.AI,
    },
    AT,
  ).incident;
}

describe('protocol engine foundation', () => {
  it('walks entry → question → action → confirmation → next step', () => {
    const ready = incidentReadyForProtocol();
    expect(selectPublishedProtocol(ready.state, [foundationProtocol])?.id).toBe(foundationProtocol.id);

    const started = startProtocol(ready, foundationProtocol, AT);
    expect(started.incident.state.currentProtocolId).toBe(foundationProtocol.id);
    expect(started.incident.state.currentStepId).toBe('step-check-response');

    const answered = answerProtocolStep(
      started.incident,
      foundationProtocol,
      { answer: ConsciousnessState.UNRESPONSIVE, certainty: Certainty.KNOWN },
      AT,
    );
    expect(answered.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
    expect(answered.incident.state.currentStepId).toBe('step-call-help');
    expect(answered.incident.state.escalationStatus).toBe(EscalationState.RECOMMENDED);

    const instructed = giveProtocolAction(answered.incident, foundationProtocol, AT);
    expect(instructed.incident.state.actions[0]?.instruction).toBe('Call emergency services now.');
    expect(instructed.incident.state.actions[0]?.status).toBe(ActionStatus.GIVEN);

    const confirmed = resolveProtocolAction(
      instructed.incident,
      foundationProtocol,
      ActionStatus.CONFIRMED,
      AT,
    );
    expect(confirmed.incident.state.actions[0]?.status).toBe(ActionStatus.CONFIRMED);
    expect(confirmed.incident.state.currentStepId).toBe('step-check-breathing');
    expect(confirmed.incident.state.completedStepIds).toEqual(['step-check-response', 'step-call-help']);
  });

  it('rejects an unpublished protocol and a blocked instruction', () => {
    const ready = incidentReadyForProtocol();
    const draft = { ...foundationProtocol, published: false };

    expect(() => startProtocol(ready, draft, AT)).toThrow(ProtocolViolationError);

    const unknown = initialIncident({
      id: 'incident-unknown',
      sessionId: 'session-unknown',
      language: Language.ENGLISH,
      at: AT,
    });
    expect(selectPublishedProtocol(unknown.state, [foundationProtocol])).toBeNull();
    expect(() => startProtocol(unknown, foundationProtocol, AT)).toThrow(ProtocolViolationError);

    const started = startProtocol(ready, foundationProtocol, AT);
    const answered = answerProtocolStep(
      started.incident,
      foundationProtocol,
      { answer: ConsciousnessState.UNRESPONSIVE, certainty: Certainty.KNOWN },
      AT,
    );

    expect(() =>
      rejectUnsupportedAction(answered.incident, foundationProtocol, 'Give food or drink'),
    ).toThrow(ProtocolViolationError);

    expect(() => giveProtocolAction(started.incident, foundationProtocol, AT)).toThrow(
      ProtocolViolationError,
    );
  });

  it('sends an uncertain answer down the explicit safe path', () => {
    const started = startProtocol(incidentReadyForProtocol(), foundationProtocol, AT);
    const uncertain = answerProtocolStep(
      started.incident,
      foundationProtocol,
      { answer: "I don't know", certainty: Certainty.UNKNOWN },
      AT,
    );

    expect(uncertain.incident.state.currentStepId).toBe('step-call-help');
    expect(uncertain.incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);
    expect(uncertain.incident.state.uncertainty.some((note) => note.field === 'patient.consciousness')).toBe(
      true,
    );
  });
});

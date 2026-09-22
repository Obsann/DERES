import { describe, expect, it } from 'vitest';
import { unconsciousAdultProtocol } from '@voicesos/protocols';
import {
  ActionStatus,
  AgeGroup,
  BreathingState,
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
import { selectPublishedProtocol, stepPrompt } from './engine.js';
import {
  answerProtocolStep,
  giveProtocolAction,
  rejectUnsupportedAction,
  resolveProtocolAction,
  startProtocol,
} from './execute.js';

const AT = '2026-09-22T18:00:00.000Z';

function readyIncident() {
  const opened = initialIncident({
    id: 'incident-mvp',
    sessionId: 'session-mvp',
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

function confirmAction(incident: ReturnType<typeof readyIncident>) {
  const given = giveProtocolAction(incident, unconsciousAdultProtocol, AT);
  return resolveProtocolAction(given.incident, unconsciousAdultProtocol, ActionStatus.CONFIRMED, AT);
}

describe('MVP unresponsive-adult protocol', () => {
  it('has source, version, escalation and prohibited actions', () => {
    expect(unconsciousAdultProtocol.published).toBe(true);
    expect(unconsciousAdultProtocol.version).toBe('1.0.0');
    expect(unconsciousAdultProtocol.source.organisation).toBe('European Resuscitation Council');
    expect(unconsciousAdultProtocol.source.title).toContain('Basic Life Support');
    expect(unconsciousAdultProtocol.contraindications.length).toBeGreaterThan(0);
    expect(unconsciousAdultProtocol.escalationRules.length).toBeGreaterThan(0);
  });

  it('guides unresponsive + not breathing using protocol text only', () => {
    const started = startProtocol(readyIncident(), unconsciousAdultProtocol, AT);
    const afterResponse = answerProtocolStep(
      started.incident,
      unconsciousAdultProtocol,
      { answer: ConsciousnessState.UNRESPONSIVE, certainty: Certainty.KNOWN },
      AT,
    );
    expect(afterResponse.incident.state.escalationStatus).toBe(EscalationState.RECOMMENDED);

    const afterCall = confirmAction(afterResponse.incident);
    const afterAirway = confirmAction(afterCall.incident);
    const afterBreathing = answerProtocolStep(
      afterAirway.incident,
      unconsciousAdultProtocol,
      { answer: BreathingState.ABSENT, certainty: Certainty.KNOWN },
      AT,
    );

    expect(afterBreathing.incident.state.currentStepId).toBe('step-cpr');
    expect(afterBreathing.incident.state.escalationStatus).toBe(EscalationState.ESCALATED);

    const cpr = giveProtocolAction(afterBreathing.incident, unconsciousAdultProtocol, AT);
    const expected = stepPrompt(
      unconsciousAdultProtocol.steps.find((step) => step.id === 'step-cpr')!,
      Language.ENGLISH,
    );
    expect(cpr.incident.state.actions.at(-1)?.instruction).toBe(expected);
    expect(cpr.incident.state.actions.at(-1)?.instruction).toContain('centre of the chest');
  });

  it('uses the recovery position when they are breathing normally', () => {
    const started = startProtocol(readyIncident(), unconsciousAdultProtocol, AT);
    const afterResponse = answerProtocolStep(
      started.incident,
      unconsciousAdultProtocol,
      { answer: ConsciousnessState.UNRESPONSIVE, certainty: Certainty.KNOWN },
      AT,
    );
    const afterCall = confirmAction(afterResponse.incident);
    const afterAirway = confirmAction(afterCall.incident);
    const afterBreathing = answerProtocolStep(
      afterAirway.incident,
      unconsciousAdultProtocol,
      { answer: BreathingState.NORMAL, certainty: Certainty.KNOWN },
      AT,
    );

    expect(afterBreathing.incident.state.currentStepId).toBe('step-recovery-position');
    const recovery = giveProtocolAction(afterBreathing.incident, unconsciousAdultProtocol, AT);
    expect(recovery.incident.state.actions.at(-1)?.instruction).toContain('onto their side');
  });

  it('follows the safe path when the answer is missing or contradictory', () => {
    const started = startProtocol(readyIncident(), unconsciousAdultProtocol, AT);
    const uncertain = answerProtocolStep(
      started.incident,
      unconsciousAdultProtocol,
      { answer: 'not sure', certainty: Certainty.UNKNOWN },
      AT,
    );
    expect(uncertain.incident.state.currentStepId).toBe('step-call-ems');
    expect(uncertain.incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);

    const afterCall = confirmAction(uncertain.incident);
    const afterAirway = confirmAction(afterCall.incident);
    const withPriorBreathing = applyCommand(
      afterAirway.incident,
      {
        kind: 'set_patient_fact',
        field: 'breathing',
        value: BreathingState.NORMAL,
        source: EventSource.USER,
      },
      AT,
    ).incident;
    const contradicted = answerProtocolStep(
      withPriorBreathing,
      unconsciousAdultProtocol,
      { answer: BreathingState.ABSENT, certainty: Certainty.KNOWN },
      AT,
    );

    expect(contradicted.incident.state.patient.breathing).toBe(BreathingState.UNKNOWN);
    expect(contradicted.incident.state.currentStepId).toBe('step-cpr');
  });

  it('rejects an unsupported emergency and a prohibited instruction', () => {
    const burn = applyCommand(
      initialIncident({
        id: 'incident-burn',
        sessionId: 'session-burn',
        language: Language.ENGLISH,
        at: AT,
      }),
      {
        kind: 'set_emergency_type',
        emergencyType: EmergencyType.BURN,
        confidence: 0.8,
        source: EventSource.AI,
      },
      AT,
    ).incident;

    expect(selectPublishedProtocol(burn.state, [unconsciousAdultProtocol])).toBeNull();
    expect(() => startProtocol(burn, unconsciousAdultProtocol, AT)).toThrow(ProtocolViolationError);

    const started = startProtocol(readyIncident(), unconsciousAdultProtocol, AT);
    const unresponsive = answerProtocolStep(
      started.incident,
      unconsciousAdultProtocol,
      { answer: ConsciousnessState.UNRESPONSIVE, certainty: Certainty.KNOWN },
      AT,
    );
    expect(() =>
      rejectUnsupportedAction(unresponsive.incident, unconsciousAdultProtocol, 'Give food or drink'),
    ).toThrow(/choke/);

    const infant = applyCommand(
      readyIncident(),
      {
        kind: 'set_patient_fact',
        field: 'ageGroup',
        value: AgeGroup.INFANT,
        source: EventSource.USER,
      },
      AT,
    ).incident;
    expect(() => startProtocol(infant, unconsciousAdultProtocol, AT)).toThrow(ProtocolViolationError);
  });
});

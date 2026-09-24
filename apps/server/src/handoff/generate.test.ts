import { describe, expect, it } from 'vitest';
import { unconsciousAdultProtocol } from '@voicesos/protocols';
import {
  ActionStatus,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  IncidentEventType,
  Language,
} from '@voicesos/shared';
import { initialIncident } from '../database/initialState.js';
import { applyCommand } from '../incidents/stateEngine.js';
import { startProtocol } from '../protocols/execute.js';
import { generateHandoff } from './generate.js';

const AT = '2026-09-24T17:40:00.000Z';

function openIncident() {
  return initialIncident({
    id: 'incident-handoff',
    sessionId: 'session-handoff',
    language: Language.ENGLISH,
    at: AT,
  });
}

describe('handoff generation', () => {
  it('does not claim facts that were never established', () => {
    const incident = openIncident();
    const handoff = generateHandoff({
      incident,
      timeline: [],
      version: 1,
      at: AT,
      id: 'handoff-1',
    });

    expect(handoff.emergencyType).toBe(EmergencyType.UNKNOWN);
    expect(handoff.criticalInformation).toEqual([]);
    expect(handoff.observedSymptoms).toEqual([]);
    expect(handoff.actionsTaken).toEqual([]);
    expect(handoff.questionsAnswered).toEqual([]);
    expect(handoff.uncertainty.some((note) => note.field === 'patient.consciousness')).toBe(true);
    expect(handoff.uncertainty.some((note) => note.field === 'patient.breathing')).toBe(true);
    expect(handoff.warnings.some((item) => item.message.includes('Emergency type was never established'))).toBe(
      true,
    );
  });

  it('lists only established critical facts and keeps the timeline that was passed in', () => {
    const typed = applyCommand(
      openIncident(),
      {
        kind: 'set_emergency_type',
        emergencyType: EmergencyType.UNCONSCIOUS,
        confidence: 0.9,
        source: EventSource.AI,
      },
      AT,
    ).incident;
    const known = applyCommand(
      typed,
      {
        kind: 'set_patient_fact',
        field: 'consciousness',
        value: ConsciousnessState.UNRESPONSIVE,
        source: EventSource.USER,
      },
      AT,
    ).incident;
    const started = startProtocol(known, unconsciousAdultProtocol, AT).incident;

    const timeline = [
      {
        id: 'evt-1',
        incidentId: started.id,
        sequence: 1,
        type: IncidentEventType.INCIDENT_CREATED,
        source: EventSource.SYSTEM,
        summary: 'Incident opened',
        payload: null,
        occurredAt: AT,
      },
    ];

    const handoff = generateHandoff({
      incident: started,
      timeline,
      protocol: unconsciousAdultProtocol,
      version: 1,
      at: AT,
      id: 'handoff-2',
    });

    expect(handoff.criticalInformation.map((fact) => fact.label).sort()).toEqual(
      ['Consciousness', 'Emergency type'].sort(),
    );
    expect(handoff.criticalInformation.every((fact) => fact.certainty === Certainty.KNOWN)).toBe(true);
    expect(handoff.criticalInformation.some((fact) => fact.value === BreathingState.NORMAL)).toBe(false);
    expect(handoff.currentProtocolName).toBe(unconsciousAdultProtocol.name);
    expect(handoff.currentStepLabel).toBe('Check response');
    expect(handoff.timeline).toEqual(timeline);
    expect(handoff.uncertainty.some((note) => note.field === 'patient.breathing')).toBe(true);
    expect(handoff.warnings.some((item) => item.message.includes('breathing was never established'))).toBe(true);
  });

  it('copies answers and actions from the incident instead of inventing them', () => {
    const afterType = applyCommand(
      openIncident(),
      {
        kind: 'set_emergency_type',
        emergencyType: EmergencyType.UNCONSCIOUS,
        confidence: 0.8,
        source: EventSource.AI,
      },
      AT,
    ).incident;
    const answered = applyCommand(
      afterType,
      {
        kind: 'record_answer',
        questionId: 'step-check-response',
        question: 'Are they responding?',
        answer: 'No',
        certainty: Certainty.KNOWN,
        source: EventSource.USER,
        updatesField: 'patient.consciousness',
        updatesValue: ConsciousnessState.UNRESPONSIVE,
      },
      AT,
    ).incident;
    const given = applyCommand(
      answered,
      {
        kind: 'give_action',
        id: 'action-1',
        protocolId: unconsciousAdultProtocol.id,
        stepId: 'step-call-ems',
        instruction: 'Call emergency services now. Put the phone on speaker if you can.',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;
    const escalated = applyCommand(
      given,
      {
        kind: 'escalate',
        to: EscalationState.RECOMMENDED,
        reason: 'Unresponsive adult',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;

    const handoff = generateHandoff({
      incident: escalated,
      timeline: [],
      protocol: unconsciousAdultProtocol,
      version: 2,
      at: AT,
      id: 'handoff-3',
    });

    expect(handoff.questionsAnswered).toHaveLength(1);
    expect(handoff.questionsAnswered[0]?.answer).toBe('No');
    expect(handoff.actionsTaken).toHaveLength(1);
    expect(handoff.actionsTaken[0]?.instruction).toBe(
      'Call emergency services now. Put the phone on speaker if you can.',
    );
    expect(handoff.actionsTaken[0]?.status).toBe(ActionStatus.GIVEN);
    expect(handoff.warnings.some((item) => item.message.includes('not confirmed'))).toBe(true);
    expect(handoff.warnings.some((item) => item.message.includes('Professional help'))).toBe(true);
    expect(handoff.observedSymptoms).toEqual([]);
  });
});

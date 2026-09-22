import { describe, expect, it } from 'vitest';
import {
  ActionStatus,
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  IncidentEventType,
  IncidentStatus,
  Language,
} from '@voicesos/shared';
import { InvalidStateTransitionError, ValidationError } from '../common/errors.js';
import { initialIncident } from '../database/initialState.js';
import { knownFacts, unknownFacts } from './facts.js';
import { applyCommand } from './stateEngine.js';

const AT = '2026-09-22T18:00:00.000Z';

function openIncident() {
  return initialIncident({
    id: 'incident-1',
    sessionId: 'session-1',
    language: Language.ENGLISH,
    at: AT,
  });
}

describe('emergency state engine', () => {
  it('applies a valid consciousness transition and tracks known facts', () => {
    const incident = openIncident();
    expect(unknownFacts(incident.state)).toContain('patient.consciousness');

    const result = applyCommand(
      incident,
      {
        kind: 'set_patient_fact',
        field: 'consciousness',
        value: ConsciousnessState.UNRESPONSIVE,
        source: EventSource.USER,
      },
      AT,
    );

    expect(result.incident.state.patient.consciousness).toBe(ConsciousnessState.UNRESPONSIVE);
    expect(knownFacts(result.incident.state)).toContain('patient.consciousness');
    expect(result.events.map((event) => event.type)).toEqual([IncidentEventType.STATE_CHANGED]);
    expect(incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);
  });

  it('rejects an invalid status transition on a closed incident', () => {
    const closed = applyCommand(openIncident(), { kind: 'close', source: EventSource.SYSTEM }, AT).incident;

    expect(() =>
      applyCommand(
        closed,
        {
          kind: 'set_patient_fact',
          field: 'breathing',
          value: BreathingState.ABSENT,
          source: EventSource.USER,
        },
        AT,
      ),
    ).toThrow(InvalidStateTransitionError);
  });

  it('rejects a command that is missing a required field', () => {
    expect(() =>
      applyCommand(
        openIncident(),
        {
          kind: 'record_answer',
          questionId: 'q-consciousness',
          question: 'Are they responding?',
          answer: '   ',
          certainty: Certainty.KNOWN,
          source: EventSource.USER,
        },
        AT,
      ),
    ).toThrow(ValidationError);
  });

  it('moves a conflicting fact to unknown instead of overwriting it', () => {
    const first = applyCommand(
      openIncident(),
      {
        kind: 'set_patient_fact',
        field: 'consciousness',
        value: ConsciousnessState.UNRESPONSIVE,
        source: EventSource.USER,
      },
      AT,
    ).incident;

    const second = applyCommand(
      first,
      {
        kind: 'set_patient_fact',
        field: 'consciousness',
        value: ConsciousnessState.RESPONSIVE,
        source: EventSource.USER,
      },
      AT,
    );

    expect(second.incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);
    expect(second.incident.state.uncertainty.some((note) => note.field === 'patient.consciousness')).toBe(
      true,
    );
    expect(second.events.map((event) => event.type)).toContain(IncidentEventType.UNCERTAINTY_RECORDED);
  });

  it('records a changed answer without dropping the earlier answer', () => {
    const first = applyCommand(
      openIncident(),
      {
        kind: 'record_answer',
        questionId: 'q-consciousness',
        question: 'Are they responding?',
        answer: 'No',
        certainty: Certainty.KNOWN,
        source: EventSource.USER,
        updatesField: 'patient.consciousness',
        updatesValue: ConsciousnessState.UNRESPONSIVE,
      },
      AT,
    ).incident;

    const second = applyCommand(
      first,
      {
        kind: 'record_answer',
        questionId: 'q-consciousness',
        question: 'Are they responding?',
        answer: 'Yes, they are talking',
        certainty: Certainty.KNOWN,
        source: EventSource.USER,
        updatesField: 'patient.consciousness',
        updatesValue: ConsciousnessState.RESPONSIVE,
      },
      AT,
    );

    expect(second.incident.state.relevantAnswers).toHaveLength(2);
    expect(second.incident.state.relevantAnswers[0]?.answer).toBe('No');
    expect(second.incident.state.relevantAnswers[1]?.certainty).toBe(Certainty.UNCERTAIN);
    expect(second.incident.state.patient.consciousness).toBe(ConsciousnessState.UNKNOWN);
    expect(first.state.relevantAnswers).toHaveLength(1);
  });

  it('completes the current protocol step and rejects a skip', () => {
    const selected = applyCommand(
      openIncident(),
      {
        kind: 'select_protocol',
        protocolId: 'protocol-unconscious',
        initialStepId: 'step-check-response',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;

    const advanced = applyCommand(
      selected,
      {
        kind: 'complete_step',
        stepId: 'step-check-response',
        nextStepId: 'step-check-breathing',
        source: EventSource.PROTOCOL,
      },
      AT,
    );

    expect(advanced.incident.state.currentStepId).toBe('step-check-breathing');
    expect(advanced.incident.state.completedStepIds).toEqual(['step-check-response']);

    expect(() =>
      applyCommand(
        advanced.incident,
        {
          kind: 'complete_step',
          stepId: 'step-recovery-position',
          nextStepId: null,
          source: EventSource.PROTOCOL,
        },
        AT,
      ),
    ).toThrow(InvalidStateTransitionError);
  });

  it('escalates forward and rejects moving escalation backwards', () => {
    const recommended = applyCommand(
      openIncident(),
      {
        kind: 'escalate',
        to: EscalationState.RECOMMENDED,
        reason: 'Unresponsive adult; professional help should be called',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;

    expect(recommended.state.escalationStatus).toBe(EscalationState.RECOMMENDED);
    expect(recommended.status).toBe(IncidentStatus.ACTIVE);

    const escalated = applyCommand(
      recommended,
      {
        kind: 'escalate',
        to: EscalationState.ESCALATED,
        reason: 'User confirmed emergency services have been called',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;

    expect(escalated.status).toBe(IncidentStatus.ESCALATED);
    expect(escalated.state.escalationStatus).toBe(EscalationState.ESCALATED);

    expect(() =>
      applyCommand(
        escalated,
        {
          kind: 'escalate',
          to: EscalationState.RECOMMENDED,
          reason: 'downgrade',
          source: EventSource.SYSTEM,
        },
        AT,
      ),
    ).toThrow(InvalidStateTransitionError);
  });

  it('recovers an abandoned session without losing established facts', () => {
    const known = applyCommand(
      openIncident(),
      {
        kind: 'set_patient_fact',
        field: 'ageGroup',
        value: AgeGroup.ADULT,
        source: EventSource.USER,
      },
      AT,
    ).incident;

    const abandoned = applyCommand(known, { kind: 'abandon', source: EventSource.SYSTEM }, AT).incident;
    expect(abandoned.status).toBe(IncidentStatus.ABANDONED);

    expect(() =>
      applyCommand(
        abandoned,
        {
          kind: 'set_emergency_type',
          emergencyType: EmergencyType.UNCONSCIOUS,
          confidence: 0.9,
          source: EventSource.AI,
        },
        AT,
      ),
    ).toThrow(InvalidStateTransitionError);

    const recovered = applyCommand(abandoned, { kind: 'recover', source: EventSource.SYSTEM }, AT).incident;
    expect(recovered.status).toBe(IncidentStatus.ACTIVE);
    expect(recovered.closedAt).toBeNull();
    expect(recovered.state.patient.ageGroup).toBe(AgeGroup.ADULT);
  });

  it('tracks given and confirmed actions on one list', () => {
    const given = applyCommand(
      openIncident(),
      {
        kind: 'give_action',
        id: 'action-1',
        protocolId: 'protocol-unconscious',
        stepId: 'step-call-help',
        instruction: 'Call emergency services now.',
        source: EventSource.PROTOCOL,
      },
      AT,
    ).incident;

    expect(given.state.actions[0]?.status).toBe(ActionStatus.GIVEN);

    const confirmed = applyCommand(
      given,
      {
        kind: 'resolve_action',
        actionId: 'action-1',
        status: ActionStatus.CONFIRMED,
        note: null,
        source: EventSource.USER,
      },
      AT,
    ).incident;

    expect(confirmed.state.actions).toHaveLength(1);
    expect(confirmed.state.actions[0]?.status).toBe(ActionStatus.CONFIRMED);
    expect(confirmed.state.actions[0]?.confirmedAt).toBe(AT);
  });
});

import type {
  ActionStatus,
  AgeGroup,
  BreathingState,
  Certainty,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  EventSource,
  Id,
  IncidentLocation,
} from '@voicesos/shared';

/**
 * A requested change to an incident.
 *
 * The state engine is the only thing allowed to apply these. Persistence
 * stores the result; the LLM may propose a command, never write state itself.
 */
export type IncidentCommand =
  | {
      kind: 'set_emergency_type';
      emergencyType: EmergencyType;
      confidence: number;
      source: EventSource;
    }
  | {
      kind: 'set_location';
      location: IncidentLocation;
      source: EventSource;
    }
  | {
      kind: 'set_people_affected';
      peopleAffected: number | null;
      source: EventSource;
    }
  | {
      kind: 'set_patient_fact';
      field: 'ageGroup';
      value: AgeGroup;
      source: EventSource;
    }
  | {
      kind: 'set_patient_fact';
      field: 'consciousness';
      value: ConsciousnessState;
      source: EventSource;
    }
  | {
      kind: 'set_patient_fact';
      field: 'breathing';
      value: BreathingState;
      source: EventSource;
    }
  | {
      kind: 'add_symptom';
      symptom: string;
      source: EventSource;
    }
  | {
      kind: 'add_observation';
      observation: string;
      source: EventSource;
    }
  | {
      kind: 'record_answer';
      questionId: Id | null;
      question: string;
      answer: string;
      certainty: Certainty;
      source: EventSource;
      /** Structured field this answer establishes, if any. */
      updatesField?: 'emergencyType' | 'peopleAffected' | 'patient.ageGroup' | 'patient.consciousness' | 'patient.breathing';
      updatesValue?: string | number;
    }
  | {
      kind: 'select_protocol';
      protocolId: Id;
      initialStepId: Id;
      source: EventSource;
    }
  | {
      kind: 'complete_step';
      stepId: Id;
      nextStepId: Id | null;
      source: EventSource;
    }
  | {
      kind: 'give_action';
      id?: Id;
      protocolId: Id | null;
      stepId: Id | null;
      instruction: string;
      source: EventSource;
    }
  | {
      kind: 'resolve_action';
      actionId: Id;
      status: Extract<ActionStatus, 'confirmed' | 'unable' | 'skipped'>;
      note: string | null;
      source: EventSource;
    }
  | {
      kind: 'record_uncertainty';
      field: string;
      reason: string;
      source: EventSource;
    }
  | {
      kind: 'escalate';
      to: EscalationState;
      reason: string;
      source: EventSource;
    }
  | {
      kind: 'close';
      source: EventSource;
    }
  | {
      kind: 'abandon';
      source: EventSource;
    }
  | {
      kind: 'recover';
      source: EventSource;
    }
  | {
      kind: 'mark_handed_off';
      source: EventSource;
    };

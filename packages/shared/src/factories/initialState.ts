import {
  AgeGroup,
  BreathingState,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  IncidentStatus,
  type Language,
} from '../enums/index.js';
import type { Id, IsoDateTime } from '../types/common.js';
import type { EmergencyState, Incident, PatientState } from '../types/incident.js';

/** Empty patient picture — nothing established yet. */
export function initialPatientState(): PatientState {
  return {
    ageGroup: AgeGroup.UNKNOWN,
    consciousness: ConsciousnessState.UNKNOWN,
    breathing: BreathingState.UNKNOWN,
    majorSymptoms: [],
    relevantObservations: [],
  };
}

/**
 * Empty emergency state for a newly opened incident.
 *
 * Everything starts UNKNOWN / empty. The state engine (Task 4) is what may
 * change these fields. Frontend mocks and backend persistence must start from
 * the same shape so Melkamu and Obsan never invent different "empty" objects.
 */
export function initialEmergencyState(at: IsoDateTime): EmergencyState {
  return {
    emergencyType: EmergencyType.UNKNOWN,
    emergencyTypeConfidence: 0,
    location: null,
    peopleAffected: null,
    patient: initialPatientState(),
    relevantAnswers: [],
    currentProtocolId: null,
    currentStepId: null,
    completedStepIds: [],
    actions: [],
    escalationStatus: EscalationState.NONE,
    uncertainty: [],
    updatedAt: at,
  };
}

/** Brand-new active incident record. */
export function initialIncident(input: {
  id: Id;
  sessionId: Id;
  language: Language;
  userId?: Id | null;
  at: IsoDateTime;
}): Incident {
  return {
    id: input.id,
    userId: input.userId ?? null,
    sessionId: input.sessionId,
    language: input.language,
    status: IncidentStatus.ACTIVE,
    state: initialEmergencyState(input.at),
    startedAt: input.at,
    closedAt: null,
    createdAt: input.at,
    updatedAt: input.at,
  };
}

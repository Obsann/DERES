import {
  AgeGroup,
  BreathingState,
  ConsciousnessState,
  EmergencyType,
  EscalationState,
  IncidentStatus,
  type EmergencyState,
  type Id,
  type Incident,
  type IsoDateTime,
  type Language,
} from '@voicesos/shared';

/**
 * Empty emergency state for a newly opened incident.
 *
 * Everything starts UNKNOWN / empty. `incidents/stateEngine` is the only
 * path allowed to change these fields; persistence only stores them.
 */
export function initialEmergencyState(at: IsoDateTime): EmergencyState {
  return {
    emergencyType: EmergencyType.UNKNOWN,
    emergencyTypeConfidence: 0,
    location: null,
    peopleAffected: null,
    patient: {
      ageGroup: AgeGroup.UNKNOWN,
      consciousness: ConsciousnessState.UNKNOWN,
      breathing: BreathingState.UNKNOWN,
      majorSymptoms: [],
      relevantObservations: [],
    },
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

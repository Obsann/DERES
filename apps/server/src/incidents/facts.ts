import {
  AgeGroup,
  BreathingState,
  ConsciousnessState,
  EmergencyType,
  type EmergencyState,
} from '@voicesos/shared';

const TRACKED_FIELDS = [
  'emergencyType',
  'location',
  'peopleAffected',
  'patient.ageGroup',
  'patient.consciousness',
  'patient.breathing',
] as const;

export type TrackedField = (typeof TRACKED_FIELDS)[number];

function isUnknown(field: TrackedField, state: EmergencyState): boolean {
  switch (field) {
    case 'emergencyType':
      return state.emergencyType === EmergencyType.UNKNOWN;
    case 'location':
      return state.location === null;
    case 'peopleAffected':
      return state.peopleAffected === null;
    case 'patient.ageGroup':
      return state.patient.ageGroup === AgeGroup.UNKNOWN;
    case 'patient.consciousness':
      return state.patient.consciousness === ConsciousnessState.UNKNOWN;
    case 'patient.breathing':
      return state.patient.breathing === BreathingState.UNKNOWN;
  }
}

/** Fields the system has established (not UNKNOWN / null). */
export function knownFacts(state: EmergencyState): TrackedField[] {
  return TRACKED_FIELDS.filter((field) => !isUnknown(field, state));
}

/** Fields the system knows it has not established. */
export function unknownFacts(state: EmergencyState): TrackedField[] {
  return TRACKED_FIELDS.filter((field) => isUnknown(field, state));
}

export function hasUncertainty(state: EmergencyState, field: string): boolean {
  return state.uncertainty.some((note) => note.field === field);
}

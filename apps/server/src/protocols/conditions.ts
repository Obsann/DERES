import {
  AgeGroup,
  BreathingState,
  ConditionOperator,
  ConsciousnessState,
  EmergencyType,
  type EmergencyState,
  type ProtocolCondition,
} from '@voicesos/shared';
import { ValidationError } from '../common/errors.js';

const UNKNOWN_VALUES = new Set<unknown>([
  null,
  undefined,
  EmergencyType.UNKNOWN,
  AgeGroup.UNKNOWN,
  ConsciousnessState.UNKNOWN,
  BreathingState.UNKNOWN,
]);

const FIELD_READERS: Record<string, (state: EmergencyState) => unknown> = {
  emergencyType: (state) => state.emergencyType,
  emergencyTypeConfidence: (state) => state.emergencyTypeConfidence,
  peopleAffected: (state) => state.peopleAffected,
  'patient.ageGroup': (state) => state.patient.ageGroup,
  'patient.consciousness': (state) => state.patient.consciousness,
  'patient.breathing': (state) => state.patient.breathing,
  currentProtocolId: (state) => state.currentProtocolId,
  currentStepId: (state) => state.currentStepId,
  escalationStatus: (state) => state.escalationStatus,
  location: (state) => state.location,
};

export function readStateField(state: EmergencyState, field: string): unknown {
  const reader = FIELD_READERS[field];
  if (!reader) {
    throw new ValidationError(`Protocol condition references unsupported field '${field}'`, [
      { path: field, message: 'unsupported state field' },
    ]);
  }
  return reader(state);
}

export function evaluateCondition(state: EmergencyState, condition: ProtocolCondition): boolean {
  const actual = readStateField(state, condition.field);

  switch (condition.operator) {
    case ConditionOperator.EQUALS:
      return actual === condition.value;
    case ConditionOperator.NOT_EQUALS:
      return actual !== condition.value;
    case ConditionOperator.IN:
      return Array.isArray(condition.value) && condition.value.some((item) => item === actual);
    case ConditionOperator.IS_KNOWN:
      return !UNKNOWN_VALUES.has(actual);
    case ConditionOperator.IS_UNKNOWN:
      return UNKNOWN_VALUES.has(actual);
    case ConditionOperator.GREATER_THAN:
      return typeof actual === 'number' && typeof condition.value === 'number' && actual > condition.value;
    case ConditionOperator.LESS_THAN:
      return typeof actual === 'number' && typeof condition.value === 'number' && actual < condition.value;
    default:
      throw new ValidationError(`Unsupported condition operator '${condition.operator}'`);
  }
}

/** Every condition must hold. An empty list is always true. */
export function conditionsHold(state: EmergencyState, conditions: ProtocolCondition[]): boolean {
  return conditions.every((condition) => evaluateCondition(state, condition));
}

import { AgeGroup, ConditionOperator, type ProtocolCondition } from '@voicesos/shared';

export const PROTOCOL_RETRIEVED_AT = '2026-10-07T00:00:00.000Z';
export const PROTOCOL_CREATED_AT = '2026-10-07T00:00:00.000Z';

export function eq(id: string, field: string, value: string, description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.EQUALS, value };
}

export function inValues(id: string, field: string, value: string[], description: string): ProtocolCondition {
  return { id, description, field, operator: ConditionOperator.IN, value };
}

export function adultOrUnknownAge(id: string): ProtocolCondition {
  return inValues(id, 'patient.ageGroup', [AgeGroup.ADULT, AgeGroup.UNKNOWN], 'Adult or age not yet established');
}

export function isPlaceCallStep(stepId: string | null | undefined): boolean {
  return typeof stepId === 'string' && stepId.includes('call-ems');
}

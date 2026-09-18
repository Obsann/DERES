import { Schema } from 'mongoose';
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
  MessageRole,
  UserRole,
  WarningSeverity,
} from '@voicesos/shared';

export const languageEnum = Object.values(Language);
export const emergencyTypeEnum = Object.values(EmergencyType);
export const incidentStatusEnum = Object.values(IncidentStatus);
export const certaintyEnum = Object.values(Certainty);
export const eventSourceEnum = Object.values(EventSource);
export const incidentEventTypeEnum = Object.values(IncidentEventType);
export const userRoleEnum = Object.values(UserRole);
export const messageRoleEnum = Object.values(MessageRole);
export const warningSeverityEnum = Object.values(WarningSeverity);
export const escalationStateEnum = Object.values(EscalationState);

export const locationSchema = new Schema(
  {
    description: { type: String, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracyMeters: { type: Number, default: null },
    certainty: { type: String, required: true, enum: certaintyEnum },
    reportedAt: { type: String, required: true },
  },
  { _id: false },
);

export const uncertaintyNoteSchema = new Schema(
  {
    field: { type: String, required: true },
    reason: { type: String, required: true },
    source: { type: String, required: true, enum: eventSourceEnum },
    recordedAt: { type: String, required: true },
  },
  { _id: false },
);

export const patientStateSchema = new Schema(
  {
    ageGroup: { type: String, required: true, enum: Object.values(AgeGroup) },
    consciousness: { type: String, required: true, enum: Object.values(ConsciousnessState) },
    breathing: { type: String, required: true, enum: Object.values(BreathingState) },
    majorSymptoms: { type: [String], required: true, default: [] },
    relevantObservations: { type: [String], required: true, default: [] },
  },
  { _id: false },
);

export const recordedAnswerSchema = new Schema(
  {
    questionId: { type: String, default: null },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    certainty: { type: String, required: true, enum: certaintyEnum },
    source: { type: String, required: true, enum: eventSourceEnum },
    recordedAt: { type: String, required: true },
  },
  { _id: false },
);

export const actionRecordSchema = new Schema(
  {
    id: { type: String, required: true },
    incidentId: { type: String, required: true },
    protocolId: { type: String, default: null },
    stepId: { type: String, default: null },
    instruction: { type: String, required: true },
    status: { type: String, required: true, enum: Object.values(ActionStatus) },
    givenAt: { type: String, required: true },
    confirmedAt: { type: String, default: null },
    note: { type: String, default: null },
  },
  { _id: false },
);

export const emergencyStateSchema = new Schema(
  {
    emergencyType: { type: String, required: true, enum: emergencyTypeEnum },
    emergencyTypeConfidence: { type: Number, required: true, min: 0, max: 1 },
    location: { type: locationSchema, default: null },
    peopleAffected: { type: Number, default: null },
    patient: { type: patientStateSchema, required: true },
    relevantAnswers: { type: [recordedAnswerSchema], required: true, default: [] },
    currentProtocolId: { type: String, default: null },
    currentStepId: { type: String, default: null },
    completedStepIds: { type: [String], required: true, default: [] },
    actions: { type: [actionRecordSchema], required: true, default: [] },
    escalationStatus: { type: String, required: true, enum: Object.values(EscalationState) },
    uncertainty: { type: [uncertaintyNoteSchema], required: true, default: [] },
    updatedAt: { type: String, required: true },
  },
  { _id: false },
);

/** Point-in-time copy of an incident event, embedded on a handoff snapshot. */
export const incidentEventSnapshotSchema = new Schema(
  {
    id: { type: String, required: true },
    incidentId: { type: String, required: true },
    sequence: { type: Number, required: true },
    type: { type: String, required: true, enum: incidentEventTypeEnum },
    source: { type: String, required: true, enum: eventSourceEnum },
    summary: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: null },
    occurredAt: { type: String, required: true },
  },
  { _id: false },
);

export const handoffFactSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    certainty: { type: String, required: true, enum: certaintyEnum },
    establishedAt: { type: String, default: null },
  },
  { _id: false },
);

export const handoffWarningSchema = new Schema(
  {
    severity: { type: String, required: true, enum: warningSeverityEnum },
    message: { type: String, required: true },
  },
  { _id: false },
);

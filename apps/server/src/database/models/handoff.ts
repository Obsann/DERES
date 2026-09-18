import { Schema, model } from 'mongoose';
import type { Handoff } from '@voicesos/shared';
import {
  actionRecordSchema,
  emergencyTypeEnum,
  escalationStateEnum,
  handoffFactSchema,
  handoffWarningSchema,
  incidentEventSnapshotSchema,
  incidentStatusEnum,
  locationSchema,
  patientStateSchema,
  recordedAnswerSchema,
  uncertaintyNoteSchema,
} from './subdocuments.js';

export interface HandoffDocument {
  _id: string;
  incidentId: string;
  version: number;
  emergencyType: Handoff['emergencyType'];
  location: Handoff['location'];
  startedAt: string;
  peopleAffected: number | null;
  patient: Handoff['patient'];
  criticalInformation: Handoff['criticalInformation'];
  observedSymptoms: string[];
  questionsAnswered: Handoff['questionsAnswered'];
  actionsTaken: Handoff['actionsTaken'];
  currentProtocolId: string | null;
  currentProtocolName: string | null;
  currentStepLabel: string | null;
  status: Handoff['status'];
  escalationStatus: Handoff['escalationStatus'];
  uncertainty: Handoff['uncertainty'];
  warnings: Handoff['warnings'];
  timeline: Handoff['timeline'];
  generatedAt: string;
}

const handoffSchema = new Schema<HandoffDocument>(
  {
    _id: { type: String, required: true },
    incidentId: { type: String, required: true },
    version: { type: Number, required: true, min: 1 },
    emergencyType: { type: String, required: true, enum: emergencyTypeEnum },
    location: { type: locationSchema, default: null },
    startedAt: { type: String, required: true },
    peopleAffected: { type: Number, default: null },
    patient: { type: patientStateSchema, required: true },
    criticalInformation: { type: [handoffFactSchema], required: true, default: [] },
    observedSymptoms: { type: [String], required: true, default: [] },
    questionsAnswered: { type: [recordedAnswerSchema], required: true, default: [] },
    actionsTaken: { type: [actionRecordSchema], required: true, default: [] },
    currentProtocolId: { type: String, default: null },
    currentProtocolName: { type: String, default: null },
    currentStepLabel: { type: String, default: null },
    status: { type: String, required: true, enum: incidentStatusEnum },
    escalationStatus: { type: String, required: true, enum: escalationStateEnum },
    uncertainty: { type: [uncertaintyNoteSchema], required: true, default: [] },
    warnings: { type: [handoffWarningSchema], required: true, default: [] },
    timeline: { type: [incidentEventSnapshotSchema], required: true, default: [] },
    generatedAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'handoffs' },
);

handoffSchema.index({ incidentId: 1, version: -1 }, { unique: true });

export const HandoffModel = model<HandoffDocument>('Handoff', handoffSchema);

export function toHandoff(doc: HandoffDocument): Handoff {
  return {
    id: doc._id,
    incidentId: doc.incidentId,
    version: doc.version,
    emergencyType: doc.emergencyType,
    location: doc.location,
    startedAt: doc.startedAt,
    peopleAffected: doc.peopleAffected,
    patient: doc.patient,
    criticalInformation: doc.criticalInformation,
    observedSymptoms: doc.observedSymptoms,
    questionsAnswered: doc.questionsAnswered,
    actionsTaken: doc.actionsTaken,
    currentProtocolId: doc.currentProtocolId,
    currentProtocolName: doc.currentProtocolName,
    currentStepLabel: doc.currentStepLabel,
    status: doc.status,
    escalationStatus: doc.escalationStatus,
    uncertainty: doc.uncertainty,
    warnings: doc.warnings,
    timeline: doc.timeline,
    generatedAt: doc.generatedAt,
  };
}

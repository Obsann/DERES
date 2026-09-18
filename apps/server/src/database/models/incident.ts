import { Schema, model } from 'mongoose';
import type { Incident } from '@voicesos/shared';
import { emergencyStateSchema, incidentStatusEnum, languageEnum } from './subdocuments.js';

export interface IncidentDocument {
  _id: string;
  userId: string | null;
  sessionId: string;
  language: Incident['language'];
  status: Incident['status'];
  state: Incident['state'];
  /** Internal monotonic counter used to assign `IncidentEvent.sequence`. */
  eventSequence: number;
  startedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const incidentSchema = new Schema<IncidentDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    sessionId: { type: String, required: true, index: true },
    language: { type: String, required: true, enum: languageEnum },
    status: { type: String, required: true, enum: incidentStatusEnum, index: true },
    state: { type: emergencyStateSchema, required: true },
    eventSequence: { type: Number, required: true, default: 0, min: 0 },
    startedAt: { type: String, required: true },
    closedAt: { type: String, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'incidents' },
);

incidentSchema.index({ status: 1, updatedAt: -1 });
incidentSchema.index({ sessionId: 1, createdAt: -1 });
incidentSchema.index({ 'state.emergencyType': 1, status: 1 });

export const IncidentModel = model<IncidentDocument>('Incident', incidentSchema);

export function toIncident(doc: IncidentDocument): Incident {
  return {
    id: doc._id,
    userId: doc.userId,
    sessionId: doc.sessionId,
    language: doc.language,
    status: doc.status,
    state: doc.state,
    startedAt: doc.startedAt,
    closedAt: doc.closedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

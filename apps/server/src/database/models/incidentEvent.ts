import { Schema, model } from 'mongoose';
import type { IncidentEvent } from '@voicesos/shared';
import { eventSourceEnum, incidentEventTypeEnum } from './subdocuments.js';

export interface IncidentEventDocument {
  _id: string;
  incidentId: string;
  sequence: number;
  type: IncidentEvent['type'];
  source: IncidentEvent['source'];
  summary: string;
  payload: Record<string, unknown> | null;
  occurredAt: string;
}

const incidentEventSchema = new Schema<IncidentEventDocument>(
  {
    _id: { type: String, required: true },
    incidentId: { type: String, required: true },
    sequence: { type: Number, required: true, min: 1 },
    type: { type: String, required: true, enum: incidentEventTypeEnum },
    source: { type: String, required: true, enum: eventSourceEnum },
    summary: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, default: null },
    occurredAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'incident_events' },
);

incidentEventSchema.index({ incidentId: 1, sequence: 1 }, { unique: true });
incidentEventSchema.index({ incidentId: 1, occurredAt: 1 });

export const IncidentEventModel = model<IncidentEventDocument>(
  'IncidentEvent',
  incidentEventSchema,
);

export function toIncidentEvent(doc: IncidentEventDocument): IncidentEvent {
  return {
    id: doc._id,
    incidentId: doc.incidentId,
    sequence: doc.sequence,
    type: doc.type,
    source: doc.source,
    summary: doc.summary,
    payload: doc.payload,
    occurredAt: doc.occurredAt,
  };
}

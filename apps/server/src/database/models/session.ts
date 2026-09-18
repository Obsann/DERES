import { Schema, model } from 'mongoose';
import type { Session } from '@voicesos/shared';
import { languageEnum } from './subdocuments.js';

export interface SessionDocument {
  _id: string;
  userId: string | null;
  language: Session['language'];
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

const sessionSchema = new Schema<SessionDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, default: null, index: true },
    language: { type: String, required: true, enum: languageEnum },
    createdAt: { type: String, required: true },
    lastSeenAt: { type: String, required: true },
    expiresAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'sessions' },
);

sessionSchema.index({ expiresAt: 1 });
sessionSchema.index({ userId: 1, lastSeenAt: -1 });

export const SessionModel = model<SessionDocument>('Session', sessionSchema);

export function toSession(doc: SessionDocument): Session {
  return {
    id: doc._id,
    userId: doc.userId,
    language: doc.language,
    createdAt: doc.createdAt,
    lastSeenAt: doc.lastSeenAt,
    expiresAt: doc.expiresAt,
  };
}

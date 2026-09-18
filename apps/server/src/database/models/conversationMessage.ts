import { Schema, model } from 'mongoose';
import type { ConversationMessage } from '@voicesos/shared';
import { languageEnum, messageRoleEnum } from './subdocuments.js';

export interface ConversationMessageDocument {
  _id: string;
  incidentId: string;
  role: ConversationMessage['role'];
  transcript: string;
  language: ConversationMessage['language'];
  recognitionConfidence: number | null;
  createdAt: string;
}

const conversationMessageSchema = new Schema<ConversationMessageDocument>(
  {
    _id: { type: String, required: true },
    incidentId: { type: String, required: true },
    role: { type: String, required: true, enum: messageRoleEnum },
    transcript: { type: String, required: true },
    language: { type: String, required: true, enum: languageEnum },
    recognitionConfidence: { type: Number, default: null, min: 0, max: 1 },
    createdAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'conversation_messages' },
);

conversationMessageSchema.index({ incidentId: 1, createdAt: 1 });

export const ConversationMessageModel = model<ConversationMessageDocument>(
  'ConversationMessage',
  conversationMessageSchema,
);

export function toConversationMessage(doc: ConversationMessageDocument): ConversationMessage {
  return {
    id: doc._id,
    incidentId: doc.incidentId,
    role: doc.role,
    transcript: doc.transcript,
    language: doc.language,
    recognitionConfidence: doc.recognitionConfidence,
    createdAt: doc.createdAt,
  };
}

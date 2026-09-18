import { Schema, model } from 'mongoose';
import {
  ConditionOperator,
  ProtocolStepKind,
  type Protocol,
} from '@voicesos/shared';
import { emergencyTypeEnum, languageEnum } from './subdocuments.js';

const protocolConditionSchema = new Schema(
  {
    id: { type: String, required: true },
    description: { type: String, required: true },
    field: { type: String, required: true },
    operator: { type: String, required: true, enum: Object.values(ConditionOperator) },
    value: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const localisedTextSchema = new Schema(
  {
    en: { type: String, required: false },
    am: { type: String, required: false },
    om: { type: String, required: false },
  },
  { _id: false },
);

const protocolTransitionSchema = new Schema(
  {
    toStepId: { type: String, default: null },
    conditions: { type: [protocolConditionSchema], required: true, default: [] },
    description: { type: String, required: true },
  },
  { _id: false },
);

const protocolStepSchema = new Schema(
  {
    id: { type: String, required: true },
    kind: { type: String, required: true, enum: Object.values(ProtocolStepKind) },
    label: { type: String, required: true },
    prompt: { type: localisedTextSchema, required: true },
    entryConditions: { type: [protocolConditionSchema], required: true, default: [] },
    acceptedAnswers: { type: [String], required: true, default: [] },
    updatesField: { type: String, default: null },
    transitions: { type: [protocolTransitionSchema], required: true, default: [] },
    requiresConfirmation: { type: Boolean, required: true },
    onUncertain: { type: String, default: null },
  },
  { _id: false },
);

const contraindicationSchema = new Schema(
  {
    id: { type: String, required: true },
    prohibitedAction: { type: String, required: true },
    conditions: { type: [protocolConditionSchema], required: true, default: [] },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const escalationRuleSchema = new Schema(
  {
    id: { type: String, required: true },
    conditions: { type: [protocolConditionSchema], required: true, default: [] },
    escalateTo: { type: String, required: true },
    instruction: { type: localisedTextSchema, required: true },
    reason: { type: String, required: true },
  },
  { _id: false },
);

const protocolSourceSchema = new Schema(
  {
    organisation: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, default: null },
    edition: { type: String, default: null },
    retrievedAt: { type: String, required: true },
    notes: { type: String, default: null },
  },
  { _id: false },
);

export interface ProtocolDocument {
  _id: string;
  name: string;
  version: string;
  emergencyType: Protocol['emergencyType'];
  source: Protocol['source'];
  entryConditions: Protocol['entryConditions'];
  initialStepId: string;
  steps: Protocol['steps'];
  contraindications: Protocol['contraindications'];
  escalationRules: Protocol['escalationRules'];
  exitConditions: Protocol['exitConditions'];
  languages: Protocol['languages'];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const protocolSchema = new Schema<ProtocolDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    version: { type: String, required: true },
    emergencyType: { type: String, required: true, enum: emergencyTypeEnum },
    source: { type: protocolSourceSchema, required: true },
    entryConditions: { type: [protocolConditionSchema], required: true, default: [] },
    initialStepId: { type: String, required: true },
    steps: { type: [protocolStepSchema], required: true, default: [] },
    contraindications: { type: [contraindicationSchema], required: true, default: [] },
    escalationRules: { type: [escalationRuleSchema], required: true, default: [] },
    exitConditions: { type: [protocolConditionSchema], required: true, default: [] },
    languages: { type: [{ type: String, enum: languageEnum }], required: true },
    published: { type: Boolean, required: true, default: false, index: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false, collection: 'protocols' },
);

protocolSchema.index({ emergencyType: 1, published: 1 });
protocolSchema.index({ emergencyType: 1, version: 1 }, { unique: true });

export const ProtocolModel = model<ProtocolDocument>('Protocol', protocolSchema);

export function toProtocol(doc: ProtocolDocument): Protocol {
  return {
    id: doc._id,
    name: doc.name,
    version: doc.version,
    emergencyType: doc.emergencyType,
    source: doc.source,
    entryConditions: doc.entryConditions,
    initialStepId: doc.initialStepId,
    steps: doc.steps,
    contraindications: doc.contraindications,
    escalationRules: doc.escalationRules,
    exitConditions: doc.exitConditions,
    languages: doc.languages,
    published: doc.published,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

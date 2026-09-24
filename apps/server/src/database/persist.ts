import {
  EventSource,
  IncidentEventType,
  type AuthUser,
  type ConversationMessage,
  type EmergencyType,
  type Handoff,
  type Id,
  type Incident,
  type IncidentEvent,
  type IncidentStatus,
  type Language,
  type Paginated,
  type Protocol,
  type Session,
} from '@voicesos/shared';
import { ConflictError, NotFoundError } from '../common/errors.js';
import { publishCreated, publishHandoff, publishMessage, publishSnapshot, publishTimelineEvent } from '../realtime/emit.js';
import { createId, nowIso } from './ids.js';
import { initialIncident } from './initialState.js';
import {
  ConversationMessageModel,
  HandoffModel,
  IncidentEventModel,
  IncidentModel,
  ProtocolModel,
  SessionModel,
  UserModel,
  toAuthUser,
  toConversationMessage,
  toHandoff,
  toIncident,
  toIncidentEvent,
  toProtocol,
  toSession,
} from './models/index.js';
import type { IncidentDocument } from './models/incident.js';
import type { IncidentEventDocument } from './models/incidentEvent.js';

function requireLean<T>(doc: T | null | undefined, resource: string): T {
  if (doc === null || doc === undefined) throw new NotFoundError(resource);
  return doc;
}

export async function createIncident(input: {
  sessionId: Id;
  language: Language;
  userId?: Id | null;
}): Promise<{ incident: Incident; createdEvent: IncidentEvent }> {
  const at = nowIso();
  const incident = initialIncident({
    id: createId(),
    sessionId: input.sessionId,
    language: input.language,
    userId: input.userId,
    at,
  });

  const createdEvent: IncidentEvent = {
    id: createId(),
    incidentId: incident.id,
    sequence: 1,
    type: IncidentEventType.INCIDENT_CREATED,
    source: EventSource.SYSTEM,
    summary: 'Incident opened',
    payload: { language: incident.language, sessionId: incident.sessionId },
    occurredAt: at,
  };

  await IncidentModel.create({
    _id: incident.id,
    userId: incident.userId,
    sessionId: incident.sessionId,
    language: incident.language,
    status: incident.status,
    state: incident.state,
    eventSequence: 1,
    startedAt: incident.startedAt,
    closedAt: incident.closedAt,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt,
  } satisfies IncidentDocument);

  await IncidentEventModel.create({
    _id: createdEvent.id,
    incidentId: createdEvent.incidentId,
    sequence: createdEvent.sequence,
    type: createdEvent.type,
    source: createdEvent.source,
    summary: createdEvent.summary,
    payload: createdEvent.payload,
    occurredAt: createdEvent.occurredAt,
  } satisfies IncidentEventDocument);

  publishCreated(incident);
  return { incident, createdEvent };
}

export async function getIncidentById(id: Id): Promise<Incident> {
  const doc = await IncidentModel.findById(id).lean<IncidentDocument>().exec();
  return toIncident(requireLean(doc, 'Incident'));
}

/** Writes status and emergency state. Does not rewrite timeline events. */
export async function saveIncidentSnapshot(incident: Incident): Promise<Incident> {
  const updated = await IncidentModel.findOneAndUpdate(
    { _id: incident.id },
    {
      $set: {
        status: incident.status,
        state: incident.state,
        closedAt: incident.closedAt,
        updatedAt: incident.updatedAt,
      },
    },
    { new: true },
  )
    .lean<IncidentDocument>()
    .exec();

  if (!updated) throw new NotFoundError('Incident');
  const saved = toIncident(updated);
  publishSnapshot(saved);
  return saved;
}

export async function appendIncidentEvent(
  incidentId: Id,
  input: Omit<IncidentEvent, 'id' | 'incidentId' | 'sequence'>,
): Promise<IncidentEvent> {
  const updated = await IncidentModel.findOneAndUpdate(
    { _id: incidentId },
    { $inc: { eventSequence: 1 }, $set: { updatedAt: input.occurredAt } },
    { new: true },
  )
    .lean<IncidentDocument>()
    .exec();

  if (!updated) throw new NotFoundError('Incident');

  const event: IncidentEvent = {
    id: createId(),
    incidentId,
    sequence: updated.eventSequence,
    type: input.type,
    source: input.source,
    summary: input.summary,
    payload: input.payload,
    occurredAt: input.occurredAt,
  };

  try {
    await IncidentEventModel.create({
      _id: event.id,
      incidentId: event.incidentId,
      sequence: event.sequence,
      type: event.type,
      source: event.source,
      summary: event.summary,
      payload: event.payload,
      occurredAt: event.occurredAt,
    } satisfies IncidentEventDocument);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 11000) {
      throw new ConflictError(`Duplicate event sequence ${event.sequence} for incident ${incidentId}`);
    }
    throw error;
  }

  publishTimelineEvent(toIncident(updated), event);
  return event;
}

/** Timeline in `sequence` order. Events are append-only and never rewritten. */
export async function listIncidentEvents(incidentId: Id): Promise<IncidentEvent[]> {
  const docs = await IncidentEventModel.find({ incidentId })
    .sort({ sequence: 1 })
    .lean<IncidentEventDocument[]>()
    .exec();
  return docs.map(toIncidentEvent);
}

export async function insertConversationMessage(
  message: Omit<ConversationMessage, 'id' | 'createdAt'> & { id?: Id; createdAt?: string },
): Promise<ConversationMessage> {
  const record: ConversationMessage = {
    id: message.id ?? createId(),
    incidentId: message.incidentId,
    role: message.role,
    transcript: message.transcript,
    language: message.language,
    recognitionConfidence: message.recognitionConfidence,
    createdAt: message.createdAt ?? nowIso(),
  };
  await ConversationMessageModel.create({
    _id: record.id,
    incidentId: record.incidentId,
    role: record.role,
    transcript: record.transcript,
    language: record.language,
    recognitionConfidence: record.recognitionConfidence,
    createdAt: record.createdAt,
  });
  publishMessage(record);
  return record;
}

export async function listConversationMessages(incidentId: Id): Promise<ConversationMessage[]> {
  const docs = await ConversationMessageModel.find({ incidentId }).sort({ createdAt: 1 }).lean().exec();
  return docs.map(toConversationMessage);
}

export async function insertProtocol(protocol: Protocol): Promise<Protocol> {
  await ProtocolModel.create({ ...protocol, _id: protocol.id });
  return protocol;
}

export async function getProtocolById(id: Id): Promise<Protocol> {
  const doc = await ProtocolModel.findById(id).lean().exec();
  return toProtocol(requireLean(doc, 'Protocol'));
}

export async function insertSession(session: Session): Promise<Session> {
  await SessionModel.create({
    _id: session.id,
    userId: session.userId,
    language: session.language,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
  });
  return session;
}

export async function getSessionById(id: Id): Promise<Session> {
  const doc = await SessionModel.findById(id).lean().exec();
  return toSession(requireLean(doc, 'Session'));
}

export async function insertHandoff(handoff: Handoff): Promise<Handoff> {
  await HandoffModel.create({ ...handoff, _id: handoff.id });
  publishHandoff(handoff);
  return handoff;
}

export async function findLatestHandoff(incidentId: Id): Promise<Handoff | null> {
  const doc = await HandoffModel.findOne({ incidentId }).sort({ version: -1 }).lean().exec();
  return doc ? toHandoff(doc) : null;
}

export async function getLatestHandoff(incidentId: Id): Promise<Handoff> {
  return requireLean(await findLatestHandoff(incidentId), 'Handoff');
}

export async function insertUser(user: AuthUser): Promise<AuthUser> {
  await UserModel.create({
    _id: user.id,
    role: user.role,
    displayName: user.displayName,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    createdAt: user.createdAt,
  });
  return user;
}

export async function getUserById(id: Id): Promise<AuthUser> {
  const doc = await UserModel.findById(id).lean().exec();
  return toAuthUser(requireLean(doc, 'User'));
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const doc = await UserModel.findOne({ email }).lean().exec();
  return doc ? toAuthUser(doc) : null;
}

export async function listIncidents(query: {
  status?: IncidentStatus;
  emergencyType?: EmergencyType;
  limit?: number;
  offset?: number;
}): Promise<Paginated<Incident>> {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.emergencyType) filter['state.emergencyType'] = query.emergencyType;
  const limit = Math.min(query.limit ?? 20, 100);
  const offset = Math.max(query.offset ?? 0, 0);
  const [docs, total] = await Promise.all([
    IncidentModel.find(filter).sort({ updatedAt: -1 }).skip(offset).limit(limit).lean<IncidentDocument[]>().exec(),
    IncidentModel.countDocuments(filter).exec(),
  ]);
  return { items: docs.map(toIncident), total, limit, offset };
}

import {
  ActionStatus,
  Certainty,
  EventSource,
  IncidentEventType,
  IncidentStatus,
  MessageRole,
  type ActionRecord,
  type AddMessageRequest,
  type ConversationMessage,
  type CreateIncidentRequest,
  type Id,
  type Incident,
  type IncidentEvent,
  type Language,
  type RecordActionRequest,
  type UpdateIncidentRequest,
} from '@voicesos/shared';
import { interpretTurn } from '../ai/orchestrate.js';
import type { LlmProvider } from '../ai/provider.js';
import { AiValidationError, UpstreamUnavailableError, ValidationError } from '../common/errors.js';
import { logger } from '../common/logger.js';
import { createId, nowIso } from '../database/ids.js';
import {
  appendIncidentEvent,
  createIncident,
  getIncidentById,
  getSessionById,
  insertConversationMessage,
  insertSession,
  listIncidentEvents,
  saveIncidentSnapshot,
} from '../database/persist.js';
import { publishedProtocols } from '../protocols/catalog.js';
import { applyIncidentCommand, commitIncidentMutation } from './apply.js';

export interface IncidentServiceOptions {
  llmProvider?: LlmProvider | null;
}

async function ensureSession(sessionId: Id | undefined, language: Language): Promise<Id> {
  if (sessionId) {
    try {
      await getSessionById(sessionId);
      return sessionId;
    } catch {
      // Create the client-supplied id so a reconnect can reuse it.
    }
  }

  const at = nowIso();
  const session = await insertSession({
    id: sessionId ?? createId(),
    userId: null,
    language,
    createdAt: at,
    lastSeenAt: at,
    expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  });
  return session.id;
}

async function recordMessage(
  incident: Incident,
  input: { role: ConversationMessage['role']; transcript: string; language: Language; recognitionConfidence?: number | null },
): Promise<ConversationMessage> {
  const message = await insertConversationMessage({
    incidentId: incident.id,
    role: input.role,
    transcript: input.transcript,
    language: input.language,
    recognitionConfidence: input.recognitionConfidence ?? null,
  });
  await appendIncidentEvent(incident.id, {
    type: IncidentEventType.MESSAGE_ADDED,
    source: input.role === MessageRole.USER ? EventSource.USER : EventSource.AI,
    summary: 'Message recorded',
    payload: { messageId: message.id, role: message.role },
    occurredAt: message.createdAt,
  });
  return message;
}

async function maybeInterpret(
  incident: Incident,
  transcript: string,
  provider: LlmProvider | null | undefined,
): Promise<Incident> {
  if (!provider) return incident;
  try {
    const result = await interpretTurn({
      incident,
      transcript,
      protocols: publishedProtocols,
      provider,
    });
    const committed = await commitIncidentMutation(result.incident, result.events);
    await insertConversationMessage({
      incidentId: incident.id,
      role: MessageRole.ASSISTANT,
      transcript: result.reply,
      language: committed.incident.language,
      recognitionConfidence: null,
    });
    await appendIncidentEvent(incident.id, {
      type: IncidentEventType.MESSAGE_ADDED,
      source: EventSource.AI,
      summary: 'Assistant reply recorded',
      payload: { source: result.source },
      occurredAt: nowIso(),
    });
    return committed.incident;
  } catch (error) {
    if (error instanceof AiValidationError || error instanceof UpstreamUnavailableError) {
      logger.warn('incident turn skipped LLM application', {
        incidentId: incident.id,
        code: error.code,
      });
      return getIncidentById(incident.id);
    }
    throw error;
  }
}

export async function openIncident(
  input: CreateIncidentRequest,
  options: IncidentServiceOptions = {},
): Promise<Incident> {
  const sessionId = await ensureSession(input.sessionId, input.language);
  const { incident } = await createIncident({
    sessionId,
    language: input.language,
  });

  if (!input.initialTranscript) return incident;

  await recordMessage(incident, {
    role: MessageRole.USER,
    transcript: input.initialTranscript,
    language: input.language,
  });
  return maybeInterpret(incident, input.initialTranscript, options.llmProvider);
}

export async function readIncident(id: Id): Promise<Incident> {
  return getIncidentById(id);
}

export async function updateIncident(id: Id, input: UpdateIncidentRequest): Promise<Incident> {
  let incident = await getIncidentById(id);

  if (input.location) {
    const result = await applyIncidentCommand(id, {
      kind: 'set_location',
      location: {
        description: input.location.description ?? null,
        latitude: input.location.latitude ?? null,
        longitude: input.location.longitude ?? null,
        accuracyMeters: input.location.accuracyMeters ?? null,
        certainty: Certainty.KNOWN,
        reportedAt: nowIso(),
      },
      source: EventSource.USER,
    });
    incident = result.incident;
  }

  if (input.language && input.language !== incident.language) {
    const at = nowIso();
    incident = await saveIncidentSnapshot({ ...incident, language: input.language, updatedAt: at });
    await appendIncidentEvent(id, {
      type: IncidentEventType.STATE_CHANGED,
      source: EventSource.USER,
      summary: 'Language updated',
      payload: { field: 'language', next: input.language },
      occurredAt: at,
    });
  }

  if (input.status && input.status !== incident.status) {
    incident = (await applyIncidentCommand(id, statusCommand(input.status))).incident;
  }

  return incident;
}

function statusCommand(status: IncidentStatus) {
  switch (status) {
    case IncidentStatus.CLOSED:
      return { kind: 'close' as const, source: EventSource.USER };
    case IncidentStatus.ABANDONED:
      return { kind: 'abandon' as const, source: EventSource.USER };
    case IncidentStatus.HANDED_OFF:
      return { kind: 'mark_handed_off' as const, source: EventSource.USER };
    case IncidentStatus.ACTIVE:
      return { kind: 'recover' as const, source: EventSource.USER };
    case IncidentStatus.ESCALATED:
      throw new ValidationError('Escalation is owned by the protocol engine, not PATCH /incidents');
  }
}

export async function addIncidentMessage(
  id: Id,
  input: AddMessageRequest,
  options: IncidentServiceOptions = {},
): Promise<ConversationMessage> {
  const incident = await getIncidentById(id);
  const message = await recordMessage(incident, input);
  if (input.role === MessageRole.USER) {
    await maybeInterpret(incident, input.transcript, options.llmProvider);
  }
  return message;
}

export async function recordIncidentAction(id: Id, input: RecordActionRequest): Promise<ActionRecord> {
  const result = await applyIncidentCommand(id, {
    kind: 'resolve_action',
    actionId: input.actionId,
    status: input.status as Extract<ActionStatus, 'confirmed' | 'unable' | 'skipped'>,
    note: input.note ?? null,
    source: EventSource.USER,
  });
  const action = result.incident.state.actions.find((item) => item.id === input.actionId);
  if (!action) {
    throw new ValidationError('Action was not applied');
  }
  return action;
}

export async function readIncidentTimeline(id: Id): Promise<IncidentEvent[]> {
  await getIncidentById(id);
  return listIncidentEvents(id);
}

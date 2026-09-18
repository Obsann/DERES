import type {
  ActionStatus,
  EmergencyType,
  IncidentStatus,
  Language,
  MessageRole,
  VoiceSessionPhase,
} from '../enums/index.js';
import type { Id } from './common.js';
import type { Handoff } from './handoff.js';
import type { ActionRecord, Incident, IncidentEvent } from './incident.js';
import type { ConversationMessage } from './conversation.js';
import type { Protocol } from './protocol.js';
import type { AuthUser, Session } from './auth.js';

/**
 * Machine-readable failure reasons.
 *
 * The client switches on `code`, never on `message`. Messages are for humans
 * and may be reworded at any time.
 */
export const ApiErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  /** The requested state change is not legal for the current incident state. */
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  /** The active protocol does not permit the requested action. */
  PROTOCOL_VIOLATION: 'PROTOCOL_VIOLATION',
  /** Model output failed schema, state, protocol or safety validation. */
  AI_VALIDATION_FAILED: 'AI_VALIDATION_FAILED',
  /** An external dependency such as the LLM or Voxide was unavailable. */
  UPSTREAM_UNAVAILABLE: 'UPSTREAM_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/** A single field-level validation problem. */
export interface ApiFieldError {
  /** Dot path to the offending field, for example `state.patient.breathing`. */
  path: string;
  message: string;
}

export interface ApiError {
  code: ApiErrorCode;
  /** Safe to show a developer. Never contains secrets or raw model output. */
  message: string;
  fieldErrors?: ApiFieldError[];
}

/**
 * Every endpoint returns this envelope, including on failure, so the client
 * has exactly one response shape to handle.
 */
export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  /** Correlates a response with server logs. */
  requestId: string;
}

export interface ApiErrorResponse {
  ok: false;
  error: ApiError;
  requestId: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Narrows an {@link ApiResponse} to its success branch. */
export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccessResponse<T> {
  return response.ok;
}

/** A page of results. */
export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/* -------------------------------------------------------------------------
 * Request and response bodies.
 *
 * Covers task.md Phase 8 and the DERES specification section 15 endpoints.
 * Declared here so Melkamu Task 19 is not blocked on Obsan Task 10.
 * ---------------------------------------------------------------------- */

/** `POST /api/incidents` */
export interface CreateIncidentRequest {
  language: Language;
  sessionId?: Id;
  /** First thing the user said, when the session opened with speech. */
  initialTranscript?: string;
}

/** `PATCH /api/incidents/:id` */
export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  language?: Language;
  location?: {
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    accuracyMeters?: number | null;
  };
}

/** `POST /api/incidents/:id/messages` (also covers DERES `.../message`) */
export interface AddMessageRequest {
  role: MessageRole;
  transcript: string;
  language: Language;
  recognitionConfidence?: number | null;
}

/**
 * `POST /api/incidents/:id/voice`
 *
 * Starts or continues a Voxide-backed voice turn. Exact provider fields may
 * grow in Task 9; this is the contract Melkamu and Obsan agree on for MVP.
 */
export interface VoiceTurnRequest {
  /** Optional client-generated turn id for idempotency / reconnect. */
  clientTurnId?: Id;
  /** Language for this utterance; defaults to the incident language. */
  language?: Language;
}

export interface VoiceTurnResponse {
  incidentId: Id;
  /** Provider session token or handle, opaque to the UI. */
  voiceSessionId: string;
  /** What the UI should show while this turn is live. */
  phase: VoiceSessionPhase;
}

/** `POST /api/incidents/:id/actions` */
export interface RecordActionRequest {
  actionId: Id;
  status: ActionStatus;
  note?: string | null;
}

/** `GET /api/incidents` and `GET /api/responder/incidents` */
export interface ListIncidentsQuery {
  status?: IncidentStatus;
  emergencyType?: EmergencyType;
  limit?: number;
  offset?: number;
}

export type CreateIncidentResponse = Incident;
export type GetIncidentResponse = Incident;
export type UpdateIncidentResponse = Incident;
export type AddMessageResponse = ConversationMessage;
export type RecordActionResponse = ActionRecord;
export type GetTimelineResponse = IncidentEvent[];
export type GetHandoffResponse = Handoff;
export type ListProtocolsResponse = Protocol[];
export type GetProtocolResponse = Protocol;
export type ListIncidentsResponse = Paginated<Incident>;
export type GetResponderIncidentResponse = Incident;

/** `POST /api/sessions` — anonymous bystander session (Task 12). */
export interface CreateSessionRequest {
  language: Language;
}

export type CreateSessionResponse = Session;
export type GetAuthUserResponse = AuthUser;

/** `GET /api/health` */
export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  uptimeSeconds: number;
  /** Per-dependency state, for example `{ database: 'up' }`. */
  dependencies: Record<string, 'up' | 'down' | 'unknown'>;
  timestamp: string;
}

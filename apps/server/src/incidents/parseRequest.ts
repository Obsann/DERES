import {
  ActionStatus,
  Certainty,
  IncidentStatus,
  Language,
  MessageRole,
  type CreateIncidentRequest,
  type RecordActionRequest,
  type AddMessageRequest,
  type UpdateIncidentRequest,
} from '@voicesos/shared';
import { ValidationError } from '../common/errors.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`${path} is required`, [{ path, message: 'required' }]);
  }
  return value.trim();
}

function optionalString(value: unknown, path: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new ValidationError(`${path} must be a string`, [{ path, message: 'must be a string' }]);
  }
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

function requireEnum<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError(`Invalid ${path}`, [{ path, message: `must be one of ${allowed.join(', ')}` }]);
  }
  return value as T;
}

export function parseCreateIncident(body: unknown): CreateIncidentRequest {
  if (!isRecord(body)) {
    throw new ValidationError('Request body must be an object');
  }
  return {
    language: requireEnum(body.language, Object.values(Language), 'language'),
    ...(optionalString(body.sessionId, 'sessionId') ? { sessionId: optionalString(body.sessionId, 'sessionId') } : {}),
    ...(optionalString(body.initialTranscript, 'initialTranscript')
      ? { initialTranscript: optionalString(body.initialTranscript, 'initialTranscript') }
      : {}),
  };
}

export function parseUpdateIncident(body: unknown): UpdateIncidentRequest {
  if (!isRecord(body)) {
    throw new ValidationError('Request body must be an object');
  }
  const update: UpdateIncidentRequest = {};
  if (body.status !== undefined) {
    update.status = requireEnum(body.status, Object.values(IncidentStatus), 'status');
  }
  if (body.language !== undefined) {
    update.language = requireEnum(body.language, Object.values(Language), 'language');
  }
  if (body.location !== undefined) {
    if (!isRecord(body.location)) {
      throw new ValidationError('location must be an object', [{ path: 'location', message: 'must be an object' }]);
    }
    const latitude = body.location.latitude;
    const longitude = body.location.longitude;
    const accuracyMeters = body.location.accuracyMeters;
    update.location = {
      description: body.location.description === undefined ? undefined : (body.location.description as string | null),
      latitude: latitude === undefined || latitude === null ? latitude : Number(latitude),
      longitude: longitude === undefined || longitude === null ? longitude : Number(longitude),
      accuracyMeters: accuracyMeters === undefined || accuracyMeters === null ? accuracyMeters : Number(accuracyMeters),
    };
    if (update.location.latitude !== undefined && update.location.latitude !== null && !Number.isFinite(update.location.latitude)) {
      throw new ValidationError('Invalid location.latitude', [{ path: 'location.latitude', message: 'must be a number' }]);
    }
    if (update.location.longitude !== undefined && update.location.longitude !== null && !Number.isFinite(update.location.longitude)) {
      throw new ValidationError('Invalid location.longitude', [{ path: 'location.longitude', message: 'must be a number' }]);
    }
  }
  if (update.status === undefined && update.language === undefined && update.location === undefined) {
    throw new ValidationError('At least one of status, language, or location is required');
  }
  return update;
}

export function parseAddMessage(body: unknown): AddMessageRequest {
  if (!isRecord(body)) {
    throw new ValidationError('Request body must be an object');
  }
  const recognition = body.recognitionConfidence;
  if (recognition !== undefined && recognition !== null) {
    if (typeof recognition !== 'number' || recognition < 0 || recognition > 1) {
      throw new ValidationError('recognitionConfidence must be between 0 and 1', [
        { path: 'recognitionConfidence', message: 'must be between 0 and 1' },
      ]);
    }
  }
  return {
    role: requireEnum(body.role, Object.values(MessageRole), 'role'),
    transcript: requireString(body.transcript, 'transcript'),
    language: requireEnum(body.language, Object.values(Language), 'language'),
    recognitionConfidence: recognition === undefined ? undefined : (recognition as number | null),
  };
}

export function parseRecordAction(body: unknown): RecordActionRequest {
  if (!isRecord(body)) {
    throw new ValidationError('Request body must be an object');
  }
  const status = requireEnum(body.status, Object.values(ActionStatus), 'status');
  if (status === ActionStatus.GIVEN) {
    throw new ValidationError('Clients confirm actions; they do not mark them given', [
      { path: 'status', message: 'use confirmed, unable, or skipped' },
    ]);
  }
  return {
    actionId: requireString(body.actionId, 'actionId'),
    status,
    note: body.note === undefined ? undefined : (body.note as string | null),
  };
}
import { randomUUID } from 'node:crypto';
import type { Id, IsoDateTime } from '@voicesos/shared';

/** Opaque record id. Same value in MongoDB `_id`, the API, and the client. */
export function createId(): Id {
  return randomUUID();
}

/** UTC ISO-8601 timestamp, matching the shared `IsoDateTime` contract. */
export function nowIso(): IsoDateTime {
  return new Date().toISOString();
}

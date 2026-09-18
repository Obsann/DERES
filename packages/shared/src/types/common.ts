import type { Certainty, EventSource } from '../enums/index.js';

/**
 * ISO-8601 timestamp string, for example `2026-09-18T08:41:12.004Z`.
 *
 * Timestamps cross the API as strings rather than `Date` so that a value is
 * identical in the database, the JSON payload and the browser.
 */
export type IsoDateTime = string;

/** Opaque identifier. */
export type Id = string;

/**
 * Where the emergency is. Every part is optional: a bystander may not know
 * their own location, and the product must not block on it.
 */
export interface IncidentLocation {
  /** Free-text description as the user gave it, for example "Bole, near Edna Mall". */
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  certainty: Certainty;
  reportedAt: IsoDateTime;
}

/**
 * A recorded gap or contradiction in what the system knows.
 *
 * Carried through to the responder handoff so a responder can see what was
 * never established, instead of assuming silence means "normal".
 */
export interface UncertaintyNote {
  /** Dot path into {@link EmergencyState}, for example `patient.breathing`. */
  field: string;
  /** Why this is uncertain, for example "user gave two different answers". */
  reason: string;
  source: EventSource;
  recordedAt: IsoDateTime;
}

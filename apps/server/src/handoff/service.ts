import type { Handoff, Id } from '@voicesos/shared';
import { nowIso } from '../database/ids.js';
import { findLatestHandoff, getIncidentById, insertHandoff, listIncidentEvents } from '../database/persist.js';
import { publishedProtocols } from '../protocols/catalog.js';
import { generateHandoff } from './generate.js';

/**
 * Returns the current handoff, generating a new version only when the incident
 * has changed since the last one. Reading must not write: every dashboard
 * refresh would otherwise mint a version and broadcast it to every dashboard.
 */
export async function createIncidentHandoff(incidentId: Id): Promise<Handoff> {
  const [incident, timeline, latest] = await Promise.all([
    getIncidentById(incidentId),
    listIncidentEvents(incidentId),
    findLatestHandoff(incidentId),
  ]);

  if (
    latest &&
    latest.timeline.length === timeline.length &&
    latest.status === incident.status &&
    incident.updatedAt <= latest.generatedAt
  ) {
    return latest;
  }

  const protocol =
    publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;

  const handoff = generateHandoff({
    incident,
    timeline,
    protocol,
    version: (latest?.version ?? 0) + 1,
    at: nowIso(),
  });

  try {
    return await insertHandoff(handoff);
  } catch (error) {
    // Two concurrent readers generated the same version; the other one won.
    if ((error as { code?: number }).code === 11000) {
      const winner = await findLatestHandoff(incidentId);
      if (winner) return winner;
    }
    throw error;
  }
}

import type { Handoff, Id } from '@voicesos/shared';
import { nowIso } from '../database/ids.js';
import { findLatestHandoff, getIncidentById, insertHandoff, listIncidentEvents } from '../database/persist.js';
import { publishedProtocols } from '../protocols/catalog.js';
import { generateHandoff } from './generate.js';

export async function createIncidentHandoff(incidentId: Id): Promise<Handoff> {
  const incident = await getIncidentById(incidentId);
  const timeline = await listIncidentEvents(incidentId);
  const latest = await findLatestHandoff(incidentId);
  const protocol =
    publishedProtocols.find((item) => item.id === incident.state.currentProtocolId) ?? null;

  const handoff = generateHandoff({
    incident,
    timeline,
    protocol,
    version: (latest?.version ?? 0) + 1,
    at: nowIso(),
  });

  return insertHandoff(handoff);
}

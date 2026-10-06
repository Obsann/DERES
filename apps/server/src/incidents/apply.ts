import type { Id, Incident, IncidentEvent } from '@voicesos/shared';
import { nowIso } from '../database/ids.js';
import { appendIncidentEvents, getIncidentById, saveIncidentSnapshot } from '../database/persist.js';
import type { IncidentCommand } from './commands.js';
import { applyCommand, type EngineEvent } from './stateEngine.js';

/**
 * Load an incident, apply one validated command, persist the new state, and
 * append the resulting timeline events. Earlier events are never rewritten.
 */
export async function applyIncidentCommand(
  incidentId: Id,
  command: IncidentCommand,
): Promise<{ incident: Incident; events: IncidentEvent[] }> {
  const current = await getIncidentById(incidentId);
  const at = nowIso();
  const result = applyCommand(current, command, at);
  return commitIncidentMutation(result.incident, result.events, at);
}

/** Persist an already-computed state change and append its timeline events. */
export async function commitIncidentMutation(
  incident: Incident,
  events: EngineEvent[],
  at = nowIso(),
): Promise<{ incident: Incident; events: IncidentEvent[] }> {
  // Independent fields (state vs. event counter), so both writes can run together.
  const [saved, persisted] = await Promise.all([
    saveIncidentSnapshot(incident),
    appendIncidentEvents(
      incident.id,
      events.map((event) => ({
        type: event.type,
        source: event.source,
        summary: event.summary,
        payload: event.payload,
        occurredAt: at,
      })),
    ),
  ]);
  return { incident: saved, events: persisted };
}

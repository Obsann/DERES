import type { Id, Incident, IncidentEvent } from '@voicesos/shared';
import { nowIso } from '../database/ids.js';
import { appendIncidentEvent, getIncidentById, saveIncidentSnapshot } from '../database/persist.js';
import type { IncidentCommand } from './commands.js';
import { applyCommand } from './stateEngine.js';

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

  const incident = await saveIncidentSnapshot(result.incident);
  const events: IncidentEvent[] = [];
  for (const event of result.events) {
    events.push(
      await appendIncidentEvent(incidentId, {
        type: event.type,
        source: event.source,
        summary: event.summary,
        payload: event.payload,
        occurredAt: at,
      }),
    );
  }

  return { incident, events };
}

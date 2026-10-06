import { initialIncident, type Incident, type Language } from '@voicesos/shared';

const PREFIX = 'local-';

export function isLocalIncidentId(id: string | null | undefined): boolean {
  return typeof id === 'string' && id.startsWith(PREFIX);
}

export function openLocalIncident(language: Language): Incident {
  const at = new Date().toISOString();
  const id = `${PREFIX}${crypto.randomUUID()}`;
  return initialIncident({ id, sessionId: id, language, at });
}

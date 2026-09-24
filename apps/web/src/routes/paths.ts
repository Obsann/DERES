/**
 * Route path constants for the emergency user flow and responder dashboard.
 *
 * task.md Phase 11 screens map onto these paths. Task 20 / 23 fill in the UI;
 * Task 18 only needs them to render without crashing.
 */
export const routes = {
  home: '/',
  emergency: {
    language: '/emergency/language',
    session: '/emergency/session',
    timeline: '/emergency/:incidentId/timeline',
    summary: '/emergency/:incidentId/summary',
    connection: '/emergency/connection',
  },
  responder: {
    list: '/responder',
    incident: '/responder/incidents/:incidentId',
  },
} as const;

export function emergencyTimelinePath(incidentId: string): string {
  return `/emergency/${incidentId}/timeline`;
}

export function emergencySummaryPath(incidentId: string): string {
  return `/emergency/${incidentId}/summary`;
}

export function responderIncidentPath(incidentId: string): string {
  return `/responder/incidents/${incidentId}`;
}

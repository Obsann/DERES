/**
 * Ethiopian emergency short codes, verified 2026-09-30 against the Ethiopian
 * Red Cross ambulance page and the French Embassy in Ethiopia emergency page.
 * Ethiopia has no unified 112/911 line; the call button dials the ambulance.
 * Coverage outside Addis Ababa varies, so the number is overridable per deploy.
 */
export const EMERGENCY_NUMBERS = {
  ambulance: import.meta.env.VITE_EMERGENCY_NUMBER?.trim() || '907',
  fire: '939',
  police: '991',
} as const;

export const emergencyCallHref = `tel:${EMERGENCY_NUMBERS.ambulance}`;

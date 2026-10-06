import { useSyncExternalStore } from 'react';
import { ApiErrorCode, EmergencyType, type Incident } from '@voicesos/shared';
import { isApiClientError } from '@/services/api';
import { responderSession } from '@/services/auth/responderToken';

export const EMERGENCY_LABEL: Record<EmergencyType, string> = {
  [EmergencyType.UNCONSCIOUS]: 'Unresponsive adult',
  [EmergencyType.SEVERE_BLEEDING]: 'Severe bleeding',
  [EmergencyType.CHOKING]: 'Choking',
  [EmergencyType.BURN]: 'Burn',
  [EmergencyType.SUSPECTED_STROKE]: 'Suspected stroke',
  [EmergencyType.SEIZURE]: 'Seizure',
  [EmergencyType.SEVERE_ALLERGIC_REACTION]: 'Severe allergic reaction',
  [EmergencyType.UNKNOWN]: 'Not yet known',
};

export function useResponderSession() {
  return useSyncExternalStore(responderSession.subscribe, responderSession.get);
}

/** An expired or revoked token sends the responder back to sign-in instead of an error screen. */
export function signOutIfUnauthorized(error: unknown): void {
  if (isApiClientError(error) && (error.code === ApiErrorCode.UNAUTHORIZED || error.status === 401)) {
    responderSession.clear();
  }
}

export function minutesAgo(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  return minutes === 0 ? 'just now' : `${minutes} min ago`;
}

export function locationText(incident: Incident): string {
  const location = incident.state.location;
  if (!location) return 'Location unknown';
  if (location.description) return location.description;
  if (location.latitude !== null && location.longitude !== null) {
    const accuracy = location.accuracyMeters ? ` (±${location.accuracyMeters} m)` : '';
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}${accuracy}`;
  }
  return 'Location unknown';
}

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  ActionStatus,
  AgeGroup,
  ApiErrorCode,
  BreathingState,
  ConsciousnessState,
  EmergencyType,
  Language,
  type ActionRecord,
  type Incident,
} from '@voicesos/shared';
import { isApiClientError } from '@/services/api';
import { responderSession, type ResponderSession } from '@/services/auth/responderToken';

export const EMERGENCY_LABEL: Record<EmergencyType, string> = {
  [EmergencyType.UNCONSCIOUS]: 'Unresponsive adult',
  [EmergencyType.SEVERE_BLEEDING]: 'Severe bleeding',
  [EmergencyType.CHOKING]: 'Choking',
  [EmergencyType.BURN]: 'Burn',
  [EmergencyType.SUSPECTED_STROKE]: 'Suspected stroke',
  [EmergencyType.SEIZURE]: 'Seizure',
  [EmergencyType.SEVERE_ALLERGIC_REACTION]: 'Severe allergic reaction',
  [EmergencyType.TRAUMATIC_INJURY]: 'Crash or injury',
  [EmergencyType.UNKNOWN]: 'Not yet known',
};

export const LANGUAGE_LABEL: Record<Language, string> = {
  [Language.ENGLISH]: 'English',
  [Language.AMHARIC]: 'Amharic',
  [Language.AFAAN_OROMO]: 'Afaan Oromoo',
};

export const CONSCIOUSNESS_LABEL: Record<ConsciousnessState, string> = {
  [ConsciousnessState.RESPONSIVE]: 'Responding',
  [ConsciousnessState.UNRESPONSIVE]: 'Not responding',
  [ConsciousnessState.UNKNOWN]: 'Unknown',
};

export const BREATHING_LABEL: Record<BreathingState, string> = {
  [BreathingState.NORMAL]: 'Breathing normally',
  [BreathingState.ABNORMAL]: 'Abnormal breathing',
  [BreathingState.ABSENT]: 'Not breathing',
  [BreathingState.UNKNOWN]: 'Unknown',
};

export const AGE_LABEL: Record<AgeGroup, string> = {
  [AgeGroup.INFANT]: 'Infant',
  [AgeGroup.CHILD]: 'Child',
  [AgeGroup.ADULT]: 'Adult',
  [AgeGroup.UNKNOWN]: 'Unknown',
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

export function crewName(session: ResponderSession | null): string {
  if (!session) return 'On shift';
  if (session.user.displayName) return session.user.displayName;
  return nameFromEmail(session.user.email ?? '');
}

export function nameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  if (!local) return 'Responder';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function caseId(id: string): string {
  return `DRS-${id.replace(/-/g, '').slice(0, 4).toUpperCase()}`;
}

export function minutesAgo(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  return minutes === 0 ? 'just now' : `${minutes} min ago`;
}

export function elapsedClock(iso: string, now = Date.now()): string {
  const total = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Tick once a second so the on-scene clock matches wall time. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function locationText(incident: Incident): string {
  const location = incident.state.location;
  if (!location) return 'Location unknown';
  if (location.description) return location.description;
  if (location.latitude !== null && location.longitude !== null) {
    const accuracy = location.accuracyMeters ? ` (±${Math.round(location.accuracyMeters)} m)` : '';
    return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}${accuracy}`;
  }
  return 'Location unknown';
}

export function drivingDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
}

export function patientLine(incident: Incident): string {
  return `${CONSCIOUSNESS_LABEL[incident.state.patient.consciousness]} · ${BREATHING_LABEL[incident.state.patient.breathing]}`;
}

function looksLikeEmsCall(action: ActionRecord): boolean {
  if (action.stepId?.includes('call-ems')) return true;
  return /call emergency|907|ድንገተኛ|tajaajila balaa/i.test(action.instruction);
}

export type EmsCallStatus = 'confirmed' | 'asked' | 'not_called';

export function emsCallStatus(actions: ActionRecord[]): EmsCallStatus {
  const calls = actions.filter(looksLikeEmsCall);
  if (calls.some((action) => action.status === ActionStatus.CONFIRMED)) return 'confirmed';
  if (calls.length > 0) return 'asked';
  return 'not_called';
}

export const EMS_LABEL: Record<EmsCallStatus, string> = {
  confirmed: 'Bystander called 907',
  asked: 'Told to call 907 — not confirmed',
  not_called: 'Bystander has not called 907',
};

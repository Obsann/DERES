import { useCallback, useEffect, useRef, useState } from 'react';
import type { Id } from '@voicesos/shared';
import { incidentsApi } from '@/services/api';

export type LocationShareStatus = 'idle' | 'requesting' | 'shared' | 'denied' | 'unavailable';

/**
 * Asks the browser for the bystander's position once per incident and sends
 * it to the server. Never blocks the emergency flow: a denial just leaves the
 * location to be described by voice.
 */
export function useIncidentLocation(incidentId: Id | null) {
  const [status, setStatus] = useState<LocationShareStatus>('idle');
  const requestedFor = useRef<Id | null>(null);

  const request = useCallback(() => {
    if (!incidentId) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }
    requestedFor.current = incidentId;
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        incidentsApi
          .update(incidentId, {
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracyMeters: Math.round(position.coords.accuracy),
            },
          })
          .then(() => setStatus('shared'))
          .catch(() => setStatus('unavailable'));
      },
      (error) => setStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }, [incidentId]);

  useEffect(() => {
    if (incidentId && requestedFor.current !== incidentId) request();
  }, [incidentId, request]);

  return { status, request };
}

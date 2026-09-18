import { useCallback, useEffect, useState } from 'react';
import { ConnectionStatus } from '@voicesos/shared';
import { getHealth, isApiClientError } from '@/services/api';

/**
 * Browser online state + optional API health probe.
 *
 * Maps to Task 19 "connection states" so screens do not invent their own.
 */
export function useConnectionStatus(options: { probeApi?: boolean } = {}) {
  const probeApi = options.probeApi ?? true;
  const [browserOnline, setBrowserOnline] = useState(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine),
  );
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);

  const probe = useCallback(async () => {
    if (!probeApi) return;
    if (!browserOnline) {
      setApiReachable(false);
      setStatus(ConnectionStatus.DISCONNECTED);
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);
    try {
      await getHealth({ skipRetry: true });
      setApiReachable(true);
      setStatus(ConnectionStatus.CONNECTED);
    } catch (error) {
      setApiReachable(false);
      setStatus(ConnectionStatus.DISCONNECTED);
      if (!isApiClientError(error)) {
        // Controlled: swallow into connection state, do not rethrow.
      }
    }
  }, [browserOnline, probeApi]);

  useEffect(() => {
    const onOnline = () => {
      setBrowserOnline(true);
      setStatus(ConnectionStatus.RECONNECTING);
    };
    const onOffline = () => {
      setBrowserOnline(false);
      setApiReachable(false);
      setStatus(ConnectionStatus.DISCONNECTED);
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    void probe();
  }, [probe]);

  return {
    status,
    browserOnline,
    apiReachable,
    refresh: probe,
  };
}

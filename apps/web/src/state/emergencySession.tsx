import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Language } from '@voicesos/shared';

/**
 * Client-side emergency session boundary.
 *
 * Holds only what the UI needs before Obsan's incident API (Task 10) and
 * Melkamu's full client (Task 19) exist. Do not put medical/protocol logic here.
 */
export interface EmergencySessionState {
  language: Language;
  incidentId: string | null;
  sessionId: string | null;
  setLanguage: (language: Language) => void;
  setIncidentId: (incidentId: string | null) => void;
  setSessionId: (sessionId: string | null) => void;
  reset: () => void;
}

const EmergencySessionContext = createContext<EmergencySessionState | null>(null);

const STORAGE_KEY = 'deres.emergency';

interface StoredSession {
  language: Language;
  incidentId: string | null;
  sessionId: string | null;
}

/** A reload mid-emergency must land back on the same incident, not a blank start. */
function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function EmergencySessionProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(readStored);
  const [language, setLanguage] = useState<Language>(stored?.language ?? Language.ENGLISH);
  const [incidentId, setIncidentId] = useState<string | null>(stored?.incidentId ?? null);
  const [sessionId, setSessionId] = useState<string | null>(stored?.sessionId ?? null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ language, incidentId, sessionId }));
    } catch {
      // Private mode without storage: the session still works until reload.
    }
  }, [language, incidentId, sessionId]);

  const value = useMemo<EmergencySessionState>(
    () => ({
      language,
      incidentId,
      sessionId,
      setLanguage,
      setIncidentId,
      setSessionId,
      reset: () => {
        setLanguage(Language.ENGLISH);
        setIncidentId(null);
        setSessionId(null);
      },
    }),
    [language, incidentId, sessionId],
  );

  return (
    <EmergencySessionContext.Provider value={value}>{children}</EmergencySessionContext.Provider>
  );
}

export function useEmergencySession(): EmergencySessionState {
  const context = useContext(EmergencySessionContext);
  if (!context) {
    throw new Error('useEmergencySession must be used inside EmergencySessionProvider');
  }
  return context;
}

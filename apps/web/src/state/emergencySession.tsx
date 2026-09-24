import {
  createContext,
  useContext,
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

export function EmergencySessionProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

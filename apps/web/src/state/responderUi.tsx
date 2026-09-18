import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ConnectionStatus } from '@voicesos/shared';

/**
 * Responder dashboard UI boundary.
 *
 * Selected incident and connection status only. Live Socket.IO sync is Task 24.
 * Connection values come from `@voicesos/shared` so they match the Task 3 contract.
 */
export interface ResponderUiState {
  selectedIncidentId: string | null;
  connection: ConnectionStatus;
  setSelectedIncidentId: (incidentId: string | null) => void;
  setConnection: (connection: ConnectionStatus) => void;
}

const ResponderUiContext = createContext<ResponderUiState | null>(null);

export function ResponderUiProvider({ children }: { children: ReactNode }) {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>(ConnectionStatus.IDLE);

  const value = useMemo<ResponderUiState>(
    () => ({
      selectedIncidentId,
      connection,
      setSelectedIncidentId,
      setConnection,
    }),
    [selectedIncidentId, connection],
  );

  return <ResponderUiContext.Provider value={value}>{children}</ResponderUiContext.Provider>;
}

export function useResponderUi(): ResponderUiState {
  const context = useContext(ResponderUiContext);
  if (!context) {
    throw new Error('useResponderUi must be used inside ResponderUiProvider');
  }
  return context;
}

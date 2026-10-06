import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Language } from '@voicesos/shared';
import { useCreateIncidentMutation } from '@/hooks';
import { isApiClientError, queryKeys } from '@/services/api';
import { openLocalIncident } from '@/services/protocol/localIncident';
import { routes } from '@/routes/paths';
import { useEmergencySession } from '@/state';

const LANGUAGE_KEY = 'deres.language';

export function rememberedLanguage(): Language | null {
  try {
    return (localStorage.getItem(LANGUAGE_KEY) as Language | null) ?? null;
  } catch {
    return null;
  }
}

export function rememberLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage blocked: the user picks again next time.
  }
}

/** One request: the server opens the anonymous session along with the incident. */
export function useStartEmergency() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useEmergencySession();
  const create = useCreateIncidentMutation();

  const enter = (incident: { id: string; sessionId: string }, language: Language) => {
    session.setLanguage(language);
    session.setIncidentId(incident.id);
    session.setSessionId(incident.sessionId);
    navigate(routes.emergency.session);
  };

  const start = (language: Language) => {
    session.setLanguage(language);
    create.mutate(
      { language },
      {
        onSuccess: (incident) => enter(incident, language),
        onError: (error) => {
          if (!isApiClientError(error) || (!error.isNetworkError && error.status < 500)) return;
          const incident = openLocalIncident(language);
          queryClient.setQueryData(queryKeys.incidents.detail(incident.id), incident);
          enter(incident, language);
        },
      },
    );
  };

  return { start, isPending: create.isPending, error: create.error };
}

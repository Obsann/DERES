import { useNavigate } from 'react-router-dom';
import type { Language } from '@voicesos/shared';
import { useCreateIncidentMutation } from '@/hooks';
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
  const session = useEmergencySession();
  const create = useCreateIncidentMutation();

  const start = (language: Language) => {
    session.setLanguage(language);
    create.mutate(
      { language },
      {
        onSuccess: (incident) => {
          session.setIncidentId(incident.id);
          session.setSessionId(incident.sessionId);
          navigate(routes.emergency.session);
        },
      },
    );
  };

  return { start, isPending: create.isPending, error: create.error };
}

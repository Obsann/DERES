import type { AuthUser } from '@voicesos/shared';

/** `POST /api/auth/responder` response. */
export interface ResponderSession {
  token: string;
  user: Pick<AuthUser, 'id' | 'role' | 'displayName' | 'email'>;
}

const STORAGE_KEY = 'deres.responder';
const listeners = new Set<() => void>();

function read(): ResponderSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ResponderSession) : null;
  } catch {
    return null;
  }
}

let current: ResponderSession | null = typeof localStorage === 'undefined' ? null : read();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Signed-in responder, shared by the API client, socket and dashboard screens. */
export const responderSession = {
  get(): ResponderSession | null {
    return current;
  },
  token(): string | null {
    return current?.token ?? null;
  },
  set(session: ResponderSession): void {
    current = session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    emit();
  },
  clear(): void {
    current = null;
    localStorage.removeItem(STORAGE_KEY);
    emit();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

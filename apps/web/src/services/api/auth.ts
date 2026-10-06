import type { ResponderSession } from '@/services/auth/responderToken';
import { apiPost } from './client';

export const authApi = {
  /** Responder sign-in with the team invite code. Anonymous bystanders never call this. */
  responderSignIn(body: { email: string; invite: string }): Promise<ResponderSession> {
    return apiPost<ResponderSession>('/api/auth/responder', body, { skipRetry: true });
  },
};

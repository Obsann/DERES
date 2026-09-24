import { Language, UserRole } from '@voicesos/shared';
import { Router } from 'express';
import { config } from '../common/config.js';
import { UnauthorizedError, ValidationError } from '../common/errors.js';
import { sendSuccess } from '../common/http.js';
import { createId, nowIso } from '../database/ids.js';
import { findUserByEmail, insertSession, insertUser } from '../database/persist.js';
import { isSupportedVoiceLanguage } from '../voice/classify.js';
import { issueResponderToken, invitesMatch } from './tokens.js';

export function createAuthRouter(): Router {
  const router = Router();

  /** Anonymous emergency session. No account. */
  router.post('/auth/session', async (req, res) => {
    const language = req.body?.language as string | undefined;
    if (!language || !isSupportedVoiceLanguage(language)) {
      throw new ValidationError('language is required', [
        { path: 'language', message: `must be one of ${Object.values(Language).join(', ')}` },
      ]);
    }
    const at = nowIso();
    const session = await insertSession({
      id: createId(),
      userId: null,
      language,
      createdAt: at,
      lastSeenAt: at,
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    sendSuccess(res, { sessionId: session.id, language: session.language }, 201);
  });

  /** Responder/admin sign-in. Invite is compared in constant time and never returned. */
  router.post('/auth/responder', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const invite = typeof req.body?.invite === 'string' ? req.body.invite : '';
    if (!email || !email.includes('@')) {
      throw new ValidationError('email is required', [{ path: 'email', message: 'required' }]);
    }
    if (!invitesMatch(invite, config.responderInvite)) {
      throw new UnauthorizedError('Authentication required');
    }

    let user = await findUserByEmail(email);
    if (!user) {
      user = await insertUser({
        id: createId(),
        role: UserRole.RESPONDER,
        displayName: null,
        email,
        preferredLanguage: Language.ENGLISH,
        createdAt: nowIso(),
      });
    }
    if (user.role !== UserRole.RESPONDER && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = issueResponderToken(user.id, user.role);
    sendSuccess(res, {
      token,
      user: {
        id: user.id,
        role: user.role,
        displayName: user.displayName,
        email: user.email,
      },
    });
  });

  return router;
}

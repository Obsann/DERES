import { Language } from '@voicesos/shared';
import { Router } from 'express';
import type { LlmProvider } from '../ai/provider.js';
import { ValidationError } from '../common/errors.js';
import { sendSuccess } from '../common/http.js';
import { isSupportedVoiceLanguage } from './classify.js';
import type { VoxideProvider } from './provider.js';
import { handleVoiceTurn, startVoiceSession } from './session.js';

export interface VoiceRouterOptions {
  llmProvider?: LlmProvider | null;
  voxideProvider?: VoxideProvider | null;
}

function requireLlm(options: VoiceRouterOptions): LlmProvider {
  if (!options.llmProvider) {
    throw new ValidationError('Voice turns need an LLM provider to interpret speech');
  }
  return options.llmProvider;
}

export function createVoiceRouter(options: VoiceRouterOptions = {}): Router {
  const router = Router();

  router.post('/voice/sessions', async (req, res) => {
    const language = req.body?.language as string | undefined;
    if (!language || !isSupportedVoiceLanguage(language)) {
      throw new ValidationError('language is required and must be a supported voice language', [
        { path: 'language', message: `must be one of ${Object.values(Language).join(', ')}` },
      ]);
    }
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : undefined;
    const { incident } = await startVoiceSession({ language, sessionId });
    sendSuccess(
      res,
      {
        incidentId: incident.id,
        sessionId: incident.sessionId,
        language: incident.language,
        reply: 'I am here. Tell me what is happening.',
      },
      201,
    );
  });

  router.post('/voice/sessions/:incidentId/turns', async (req, res) => {
    const result = await handleVoiceTurn(
      {
        incidentId: req.params.incidentId as string,
        transcript: req.body?.transcript,
        recognitionConfidence: req.body?.recognitionConfidence,
        audioBase64: req.body?.audioBase64,
        mimeType: req.body?.mimeType,
        silence: Boolean(req.body?.silence),
        timeout: Boolean(req.body?.timeout),
        interrupted: Boolean(req.body?.interrupted),
        recognitionFailed: Boolean(req.body?.recognitionFailed),
      },
      {
        llmProvider: requireLlm(options),
        voxideProvider: options.voxideProvider,
      },
    );

    sendSuccess(res, {
      incidentId: result.incident.id,
      heard: result.heard,
      reply: result.reply,
      source: result.source,
      failure: result.failure,
    });
  });

  return router;
}
